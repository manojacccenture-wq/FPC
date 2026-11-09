import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Pre-typed useDispatch hook matching our RootState & AppDispatch
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Pre-typed useSelector hook with automatic RootState inference
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

