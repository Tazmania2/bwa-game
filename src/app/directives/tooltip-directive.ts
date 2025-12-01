import {Directive, ElementRef, Input} from "@angular/core";

const toolTipId = "toolTip";

@Directive({
    selector: '[toolTip]'
})
export class TooltipDirective {
    @Input()
    toolTip: string | undefined | null = '';

    @Input()
    delay: number = 500;

    private timeoutId: any;
    private ttEl: any;

    constructor(private el: ElementRef) {
        el.nativeElement.addEventListener('mouseenter', (e: any) => {
            if (!this.toolTip)
                return;
            this.ttEl = document.getElementById(toolTipId);
            this.setPos(e.clientX, e.clientY);
            el.nativeElement.addEventListener('mousemove', this.updatePos);
            this.timeoutId = setTimeout(() => {
                this.ttEl.innerText = this.toolTip;
                this.ttEl.className = 'active';
            }, this.delay);
        });

        el.nativeElement.addEventListener('mouseleave', (e: any) => {
            const ttEl = document.getElementById(toolTipId);
            ttEl!.innerText = '';
            ttEl!.className = '';
            el.nativeElement.removeEventListener('mousemove', this.updatePos);
            clearTimeout(this.timeoutId);
        });
    }

    setPos(x: number, y: number) {
        const tooltipWidth = 100; // max-width do tooltip
        const padding = 10; // padding da borda da tela
        const offset = 5; // offset do cursor
        
        // Verifica se o tooltip vai sair da tela pela direita
        if (x + offset + tooltipWidth > window.innerWidth - padding) {
            // Posiciona o tooltip à esquerda do cursor
            this.ttEl.style.left = `${x - tooltipWidth - offset}px`;
        } else {
            // Posiciona o tooltip à direita do cursor (comportamento padrão)
            this.ttEl.style.left = `${x + offset}px`;
        }
        
        this.ttEl.style.top = `${y + offset}px`;
    }

    updatePos = (ee: any) => {
        this.setPos(ee.clientX, ee.clientY);
    }

}

