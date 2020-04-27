import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage } from './toast-service.interface';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  visibleToasts$: BehaviorSubject<ToastMessage[]> = new BehaviorSubject([]);

  private toasts: ToastMessage[] = [];
  private toastTimers: { toast: ToastMessage; timer: any }[] = [];

  private defaultAnimationMs = 295;

  private currentKey = 1;

  message(message, params?: ToastMessage) {
    const toast = params || {};
    toast.type = 'neutral';
    toast.message = message;

    return this.create(toast);
  }

  success(message: string, params?: ToastMessage) {
    const toast = params || {};
    toast.type = 'success';
    toast.message = message;

    return this.create(toast);
  }

  error(message: string, params?: ToastMessage) {
    const toast = params || {};
    toast.type = 'error';
    toast.message = message;

    return this.create(toast);
  }

  info(message: string, params?: ToastMessage) {
    const toast = params || {};
    toast.type = 'info';
    toast.message = message;

    return this.create(toast);
  }

  warning(message: string, params?: ToastMessage) {
    const toast = params || {};
    toast.type = 'warning';
    toast.message = message;

    return this.create(toast);
  }

  create(params: ToastMessage) {
    const toast: ToastMessage = this.defaultToast(params);

    if (toast.unique) {
      this.destroyAll();
      this.toasts = [toast];
    } else {
      this.toasts.push(toast);
    }

    this.visibleToasts$.next(this.toasts);

    return toast;
  }

  destroy(toastObj: ToastMessage, animate: boolean = true) {
    // eslint-disable-next-line no-param-reassign
    toastObj.visible = false;

    const timeoutObj = this.toastTimers.find((timer) => timer.toast.key === toastObj.key);

    if (timeoutObj && timeoutObj.timer) {
      clearTimeout(timeoutObj.timer);
      timeoutObj.timer = null;
      this.toastTimers = this.toastTimers.filter((timer) => timer.toast.key === toastObj.key);
    }

    if (toastObj.onDismiss) {
      toastObj.onDismiss();
    }

    if (animate) {
      setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.key !== toastObj.key);
        this.visibleToasts$.next(this.toasts);
      }, toastObj.animationDuration);
    } else {
      this.toasts = this.toasts.filter((toast) => toast.key !== toastObj.key);
      this.visibleToasts$.next(this.toasts);
    }
  }

  destroyAll() {
    for (const toast of this.toasts) {
      this.destroy(toast, false);
    }
  }

  handleButtonClick(toastObj: ToastMessage) {
    if (toastObj.onClick) {
      toastObj.onClick();
    }

    this.destroy(toastObj);
  }

  private defaultToast(params: ToastMessage) {
    const toast = { ...params };
    toast.type = toast.type || 'info';

    toast.timeout = toast.timeout >= 0 ? toast.timeout : 3000;

    if (!toast.icon) {
      toast.icon = this.getDefaultIcon(toast);
    }
    toast.animationDuration = toast.animationDuration || this.defaultAnimationMs;

    toast.key = this.generateKey();
    toast.visible = true;

    if (toast.timeout > 0) {
      const timeoutTimer = setTimeout(() => {
        this.destroy(toast);
      }, toast.timeout);

      this.toastTimers.push({ toast, timer: timeoutTimer });
    }

    return toast;
  }

  private generateKey() {
    this.currentKey += 1;
    return this.currentKey;
  }

  private getDefaultIcon(toast: ToastMessage) {
    switch (toast.type) {
      case 'success':
        return 'checkmark-circle';
      case 'info':
        return 'information-circle';
      case 'error':
        return 'close';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle-outline';
    }
  }
}
