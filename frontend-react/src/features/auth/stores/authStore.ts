// Auth store đã được migrate sang Redux Toolkit.

// File này chỉ export lại từ Redux store để tương thích ngược.
export {
  useAppSelector as useAuthSelector,
  useAppDispatch,
} from "@/shared/stores/redux/hooks";
export { loginAction, logoutAction } from "@/shared/stores/redux/authActions";
export { store } from "@/shared/stores/redux/store";
