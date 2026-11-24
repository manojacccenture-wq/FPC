import React, { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { ChevronRight } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { Button } from '../../../shared/components/Button';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import {
  addressLocationSchema,
  type AddressLocationFormValues,
} from '../schemas/addressLocation.schema';
import type { FpcAddressLocationFormData } from '../types';
import { addressLocationGuidance } from '../constants/fieldGuidance';
import {
  CoordinateLocationControl,
  type CoordinateConflict,
} from './CoordinateLocationControl';
import { useDeviceLocation } from '../../../shared/hooks/useDeviceLocation';
import { useLazyGeocodeAddressQuery } from '../api/geocodingApi';
import { ADDRESS_GEOCODING_ENABLED } from '../../../shared/config/env';
import {
  parseFieldCoordinates,
  resolveCoordinateAssignment,
} from '../utils/coordinateAssignment';
import { addressKey, isCompleteAddress, toGeocodeAddress } from '../utils/geocodeAddress';
import { formatCoordinate } from '../../../shared/utils/coordinates';
import type { CoordinateSource, GeoCoordinates } from '../../../shared/types/geolocation.types';

export interface FpcAddressLocationFormProps {
  initialData?: Partial<FpcAddressLocationFormData> | null;
  onSubmit: (values: AddressLocationFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
  isReadOnly?: boolean;
  onNextStep?: () => void;
}

const STATE_OPTIONS = [
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Bihar', label: 'Bihar' },
];

const DISTRICT_OPTIONS = [
  { value: 'Jajpur', label: 'Jajpur' },
  { value: 'Keonjhar', label: 'Keonjhar' },
  { value: 'West Singhbhum', label: 'West Singhbhum' },
  { value: 'Seraikela-Kharsawan', label: 'Seraikela-Kharsawan' },
];

const BLOCK_OPTIONS = [
  { value: 'Jajpur Sadar', label: 'Jajpur Sadar' },
  { value: 'Danagadi', label: 'Danagadi' },
  { value: 'Sukinda', label: 'Sukinda' },
  { value: 'Korei', label: 'Korei' },
  { value: 'Dharamsala', label: 'Dharamsala' },
];

const GRAM_PANCHAYAT_OPTIONS = [
  { value: 'Kalinganagar', label: 'Kalinganagar' },
  { value: 'Danagadi', label: 'Danagadi' },
  { value: 'Brahmanajhar', label: 'Brahmanajhar' },
  { value: 'Chorda', label: 'Chorda' },
  { value: 'Jakhapura', label: 'Jakhapura' },
];

const VILLAGE_OPTIONS = [
  { value: 'Kalinganagar', label: 'Kalinganagar' },
  { value: 'Gobardhanpur', label: 'Gobardhanpur' },
  { value: 'Duburi', label: 'Duburi' },
  { value: 'Salijanga', label: 'Salijanga' },
];

const GEOCODE_FAILURE_MESSAGE =
  'Address lookup is unavailable right now. Use your current location or enter the coordinates manually.';

export const FpcAddressLocationForm: React.FC<FpcAddressLocationFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
  isReadOnly = false,
  onNextStep,
}) => {
  const formValues: AddressLocationFormValues = {
    streetAddress: initialData?.streetAddress || '',
    state: initialData?.state || 'Odisha',
    district: initialData?.district || 'Jajpur',
    block: initialData?.block || 'Jajpur Sadar',
    gramPanchayat: initialData?.gramPanchayat || '',
    village: initialData?.village || '',
    pinCode: initialData?.pinCode || '',
    officeMobile: initialData?.officeMobile || '',
    officialEmail: initialData?.officialEmail || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    coordinateSource: initialData?.coordinateSource || '',
    coordinatesConfirmed: initialData?.coordinatesConfirmed ?? false,
  };

  // ZERO useEffect: initial values populated directly during component mount
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useFpcForm<AddressLocationFormValues>({
    schema: addressLocationSchema,
    defaultValues: formValues,
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const gps = useDeviceLocation();
  const [triggerGeocode] = useLazyGeocodeAddressQuery();
  const [geocoding, setGeocoding] = useState<{ status: 'idle' | 'loading' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [conflict, setConflict] = useState<CoordinateConflict | null>(null);

  /** Values this form wrote itself, so it may replace them later. */
  const lastAutoFilledRef = useRef<GeoCoordinates | null>(null);
  /** Guards against an older lookup resolving after a newer one. */
  const geocodeRequestRef = useRef(0);

  const latitudeValue = watch('latitude') ?? '';
  const longitudeValue = watch('longitude') ?? '';
  const coordinateSource = (watch('coordinateSource') ?? '') as CoordinateSource;
  const coordinatesConfirmed = watch('coordinatesConfirmed') === true;

  const writeCoordinates = (incoming: GeoCoordinates, source: 'gps' | 'geocoding') => {
    const decision = resolveCoordinateAssignment({
      latitude: getValues('latitude') ?? '',
      longitude: getValues('longitude') ?? '',
      lastAutoFilled: lastAutoFilledRef.current,
      currentSource: (getValues('coordinateSource') ?? '') as CoordinateSource,
      incomingSource: source,
      incoming,
    });

    if (decision.action === 'noop') {
      setConflict(null);
      return;
    }

    if (decision.action === 'conflict') {
      setConflict({
        incoming,
        incomingSource: source,
        current:
          parseFieldCoordinates(getValues('latitude') ?? '', getValues('longitude') ?? '') ?? incoming,
        currentSource: (getValues('coordinateSource') ?? '') as CoordinateSource,
      });
      return;
    }

    lastAutoFilledRef.current = incoming;
    setValue('latitude', formatCoordinate(incoming.latitude), { shouldDirty: true });
    setValue('longitude', formatCoordinate(incoming.longitude), { shouldDirty: true });
    setValue('coordinateSource', source, { shouldDirty: true });
    // Device coordinates are the administrator's position, not the office: they
    // need an explicit confirmation. Address coordinates describe the address itself.
    setValue('coordinatesConfirmed', source === 'geocoding', { shouldDirty: true });
    setConflict(null);
  };

  const handleDetect = async () => {
    setConflict(null);
    const outcome = await gps.detect();
    if (!outcome.ok) return;
    writeCoordinates(outcome.coordinates, 'gps');
  };

  const handleResolveConflict = (choice: 'incoming' | 'keep') => {
    if (!conflict) return;

    if (choice === 'keep') {
      setConflict(null);
      return;
    }

    lastAutoFilledRef.current = conflict.incoming;
    setValue('latitude', formatCoordinate(conflict.incoming.latitude), { shouldDirty: true });
    setValue('longitude', formatCoordinate(conflict.incoming.longitude), { shouldDirty: true });
    setValue('coordinateSource', conflict.incomingSource, { shouldDirty: true });
    setValue('coordinatesConfirmed', conflict.incomingSource === 'geocoding', { shouldDirty: true });
    setConflict(null);
  };

  const handleManualCoordinateChange = () => {
    lastAutoFilledRef.current = null;
    setConflict(null);
    if (getValues('coordinateSource') !== 'manual') {
      setValue('coordinateSource', 'manual', { shouldDirty: true });
      setValue('coordinatesConfirmed', true, { shouldDirty: true });
    }
  };

  const handleConfirmationChange = (checked: boolean) => {
    setValue('coordinatesConfirmed', checked, { shouldDirty: true, shouldValidate: true });
  };

  /** Looks up the entered address; triggered from field blur, never on mount. */
  const requestAddressGeocoding = async () => {
    if (!ADDRESS_GEOCODING_ENABLED || isReadOnly) return;

    const address = toGeocodeAddress(getValues());
    if (!isCompleteAddress(address)) return;

    const requestId = geocodeRequestRef.current + 1;
    geocodeRequestRef.current = requestId;
    setGeocoding({ status: 'loading', message: 'Looking up coordinates for this address…' });

    try {
      const result = await triggerGeocode(address).unwrap();

      // Drop stale responses: a newer lookup started, or the address changed.
      if (geocodeRequestRef.current !== requestId) return;
      if (addressKey(toGeocodeAddress(getValues())) !== addressKey(address)) return;

      setGeocoding({ status: 'idle', message: '' });
      writeCoordinates({ latitude: result.latitude, longitude: result.longitude }, 'geocoding');
    } catch {
      if (geocodeRequestRef.current !== requestId) return;
      setGeocoding({ status: 'error', message: GEOCODE_FAILURE_MESSAGE });
    }
  };

  const handleAddressBlur = () => {
    void requestAddressGeocoding();
  };

  // Registration is read once per render so the extra handlers below can run after
  // React Hook Form's own change/blur logic has stored the new value.
  const streetAddressField = register('streetAddress');
  const pinCodeField = register('pinCode');
  const latitudeField = register('latitude');
  const longitudeField = register('longitude');

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      applyServerErrors(err, setError);
    }
  });

  const requiresConfirmation =
    coordinateSource === 'gps' &&
    latitudeValue.trim().length > 0 &&
    longitudeValue.trim().length > 0 &&
    !coordinatesConfirmed;

  const sourceHelperText =
    coordinateSource === 'gps'
      ? 'Optional · From your device location'
      : coordinateSource === 'geocoding'
        ? 'Optional · From the registered address'
        : coordinateSource === 'manual'
          ? 'Optional · Entered manually'
          : 'Optional';

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <FormServerError errors={errors} />

      {/* Main Card */}
      <Card
        variant="default"
        padding="none"
        className="p-6 sm:p-8 rounded-2xl border-neutral-200/80 shadow-2xs space-y-6"
      >
        {/* Header with Step 06 Badge */}
        <div>
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
              06
            </div>
            <div>
              <h3 className="text-primary">
                Address & location
              </h3>
              <p className="text-secondary mt-0.5">
                Use the details on your official company documents.
              </p>
            </div>
          </div>

          {/* Location Hierarchy Trail */}
          <small className="text-secondary font-medium mt-3 block">
            State → District → Block → Gram Panchayat → Village
          </small>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Street Address & State */}
          <Input
            id="fpc-street-address"
            guidance={addressLocationGuidance.streetAddress}
            label="Registered office street address *"
            required
            disabled={isReadOnly}
            placeholder="Enter registered office address"
            error={errors.streetAddress?.message}
            {...streetAddressField}
            onBlur={(event) => {
              streetAddressField.onBlur(event);
              handleAddressBlur();
            }}
          />
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <Select
                id="fpc-state"
                guidance={addressLocationGuidance.state}
                label="State *"
                required
                disabled={isReadOnly}
                options={STATE_OPTIONS}
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.state?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={() => {
                  field.onBlur();
                  handleAddressBlur();
                }}
              />
            )}
          />

          {/* Row 2: District & Block */}
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Select
                id="fpc-district"
                guidance={addressLocationGuidance.district}
                label="District *"
                required
                disabled={isReadOnly}
                options={DISTRICT_OPTIONS}
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.district?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={() => {
                  field.onBlur();
                  handleAddressBlur();
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="block"
            render={({ field }) => (
              <Select
                id="fpc-block"
                guidance={addressLocationGuidance.block}
                label="Block *"
                required
                disabled={isReadOnly}
                options={BLOCK_OPTIONS}
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.block?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={() => {
                  field.onBlur();
                  handleAddressBlur();
                }}
              />
            )}
          />

          {/* Row 3: Gram Panchayat & Village */}
          <Controller
            control={control}
            name="gramPanchayat"
            render={({ field }) => (
              <Select
                id="fpc-gp"
                guidance={addressLocationGuidance.gramPanchayat}
                label="Gram Panchayat *"
                required
                disabled={isReadOnly}
                options={GRAM_PANCHAYAT_OPTIONS}
                placeholder="Select Gram Panchayat"
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.gramPanchayat?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={() => {
                  field.onBlur();
                  handleAddressBlur();
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="village"
            render={({ field }) => (
              <Select
                id="fpc-village"
                guidance={addressLocationGuidance.village}
                label="Village *"
                required
                disabled={isReadOnly}
                options={VILLAGE_OPTIONS}
                placeholder="Select village"
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.village?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={() => {
                  field.onBlur();
                  handleAddressBlur();
                }}
              />
            )}
          />

          {/* Row 4: PIN code & Office mobile number */}
          <Input
            id="fpc-pincode"
            guidance={addressLocationGuidance.pinCode}
            label="PIN code *"
            required
            disabled={isReadOnly}
            placeholder="Enter PIN code"
            helperText="6 digits"
            error={errors.pinCode?.message}
            {...pinCodeField}
            onBlur={(event) => {
              pinCodeField.onBlur(event);
              handleAddressBlur();
            }}
          />
          <Input
            id="fpc-office-mobile"
            guidance={addressLocationGuidance.officeMobile}
            type="tel"
            label="Office mobile number *"
            required
            disabled={isReadOnly}
            placeholder="+91 9437890123"
            error={errors.officeMobile?.message}
            {...register('officeMobile')}
          />

          {/* Row 5: Official email (full-width) */}
          <Input
            id="fpc-official-email"
            containerClassName="col-span-1 md:col-span-2"
            guidance={addressLocationGuidance.officialEmail}
            type="email"
            label="Official email address *"
            required
            disabled={isReadOnly}
            placeholder="admin@kalinganagarfpc.in"
            error={errors.officialEmail?.message}
            {...register('officialEmail')}
          />

          {/* Row 6: Latitude & Longitude (side by side) */}
          <Input
            id="fpc-latitude"
            guidance={addressLocationGuidance.latitude}
            label="Latitude"
            disabled={isReadOnly}
            placeholder="Enter latitude"
            helperText={sourceHelperText}
            error={errors.latitude?.message}
            {...latitudeField}
            onChange={(event) => {
              latitudeField.onChange(event);
              handleManualCoordinateChange();
            }}
          />

          <Input
            id="fpc-longitude"
            guidance={addressLocationGuidance.longitude}
            label="Longitude"
            disabled={isReadOnly}
            placeholder="Enter longitude"
            helperText={sourceHelperText}
            error={errors.longitude?.message}
            {...longitudeField}
            onChange={(event) => {
              longitudeField.onChange(event);
              handleManualCoordinateChange();
            }}
          />

          {/* Row 7: location detection (full-width) */}
          <div className="col-span-1 md:col-span-2">
            <CoordinateLocationControl
              isReadOnly={isReadOnly}
              gpsStatus={gps.status}
              gpsMessage={gps.message}
              gpsCoordinates={gps.coordinates}
              accuracyMeters={gps.accuracyMeters}
              onDetect={() => {
                void handleDetect();
              }}
              geocodingStatus={geocoding.status}
              geocodingMessage={geocoding.message}
              conflict={conflict}
              onResolveConflict={handleResolveConflict}
              source={coordinateSource}
              requiresConfirmation={requiresConfirmation}
              confirmed={coordinatesConfirmed}
              onConfirmationChange={handleConfirmationChange}
            />
          </div>
        </div>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onPreviousStep}
          className="rounded-full bg-brand-soft text-brand hover:bg-forest-100 px-6 py-2.5 text-xs font-semibold"
        >
          ← Previous Step
        </Button>
        {isReadOnly ? (
          onNextStep && (
            <Button
              type="button"
              variant="primary"
              onClick={onNextStep}
              className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              Next: Business Activities →
            </Button>
          )
        ) : (
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Saving location..."
            className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            Save and Continue →
          </Button>
        )}
      </div>
    </form>
  );
};
