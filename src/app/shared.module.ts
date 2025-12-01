import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {FlexDirective} from "./directives/flex.directive";
import {FlexItemDirective} from "./directives/flex-item.directive";
import {FullDirective} from "./directives/full.directive";
import {MarginTopDirective} from "./directives/margin/margin-top.directive";
import {MarginBottomDirective} from "./directives/margin/margin-bottom.directive";
import {MarginLeftDirective} from "./directives/margin/margin-left.directive";
import {MarginRightDirective} from "./directives/margin/margin-right.directive";
import {WidthDirective} from "./directives/size/width.directive";
import {HeightDirective} from "./directives/size/height.directive";
import {TooltipDirective} from "./directives/tooltip-directive";
import {ScrollDirective} from "./directives/scroll.directive";
import {EnableShimmerDirective} from "./directives/shimmer/enable-shimmer.directive";
import {HoverFunctionDirective} from "./directives/hover/hover-function-directive";
import {HoverDirective} from "./directives/hover/hover-directive";
import {NumberFormatPipe} from "./pipes/number-format.pipe";
import {DateFormatPipe} from "./pipes/date-format.pipe";

@NgModule({
    declarations: [
        FlexDirective,
        FlexItemDirective,
        FullDirective,
        MarginTopDirective,
        MarginBottomDirective,
        MarginLeftDirective,
        MarginRightDirective,
        WidthDirective,
        HeightDirective,
        TooltipDirective,
        ScrollDirective,
        EnableShimmerDirective,
        HoverDirective,
        HoverFunctionDirective,
        NumberFormatPipe,
        DateFormatPipe
    ],
    imports: [
        CommonModule,
        TranslateModule,
        ScrollingModule
    ],
    exports: [
        CommonModule,
        TranslateModule,
        ScrollingModule,
        FlexDirective,
        FlexItemDirective,
        FullDirective,
        MarginTopDirective,
        MarginBottomDirective,
        MarginLeftDirective,
        MarginRightDirective,
        WidthDirective,
        HeightDirective,
        TooltipDirective,
        ScrollDirective,
        EnableShimmerDirective,
        HoverDirective,
        HoverFunctionDirective,
        NumberFormatPipe,
        DateFormatPipe
    ]
})
export class SharedModule {
}
