import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class BreakpointProvider {
    getBreakpoint() {
        let element = (document as any).documentElement;
        if (element.computedStyleMap) {
            return (element.computedStyleMap().get('--screen-type')?.[0] || '').replaceAll('"', '');
            ;
        } else {
            return (window.getComputedStyle(element).getPropertyValue('--screen-type')?.[0] || '').replaceAll('"', '');
        }
    }

    isMobile() {
        return !this.getBreakpoint() || this.getBreakpoint() === 'sm';
    }

    isTablet() {
        return this.getBreakpoint() === 'md';
    }

    isDesktop() {
        return this.getBreakpoint() === 'lg';
    }
}
