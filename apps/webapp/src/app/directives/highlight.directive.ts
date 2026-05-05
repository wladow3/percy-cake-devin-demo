/** ========================================================================
Copyright 2019 T-Mobile, USA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
See the LICENSE file for additional language around disclaimer of warranties.

Trademark Disclaimer: Neither the name of "T-Mobile, USA" nor the names of
its contributors may be used to endorse or promote products derived from this
software without specific prior written permission.
===========================================================================
*/

import { Directive, ElementRef, Input, OnChanges } from "@angular/core";
import { animationFrameScheduler } from "rxjs";
import * as cheerio from "cheerio";
import { HighlightJS } from "ngx-highlightjs";
import { YamlService } from "services/yaml.service";

/**
 * Custom highlight directive that colors variable references.
 */
@Directive({
  standalone: false,
  selector: "[appHighlight]"
})
export class HighlightDirective implements OnChanges {

  @Input("appHighlight") code: string;
  @Input() language = "yaml";

  constructor(
    private el: ElementRef,
    private hljs: HighlightJS,
    private yamlService: YamlService
  ) {
    this.el.nativeElement.classList.add("hljs");
  }

  ngOnChanges() {
    this.highlightCode();
  }

  private async highlightCode() {
    if (!this.code) {
      return;
    }

    const result = await this.hljs.highlight(this.code, { language: this.language });

    let html = result.value;

    if (this.language === "yaml") {
      html = this.postProcessYaml(html);
    }

    animationFrameScheduler.schedule(() =>
      this.el.nativeElement.innerHTML = html || ""
    );
  }

  private postProcessYaml(code: string): string {
    const $ = cheerio.load(code);

    const numSpans = $("span.hljs-number");
    numSpans.each((_idx, span) => {
      if (
        !span.prev ||
        !span.prev.prev ||
        !(span.prev.prev as any).firstChild ||
        ((span.prev.prev as any).firstChild.data !== "!!int" &&
        (span.prev.prev as any).firstChild.data !== "!!float")
      ) {
        $(span)
          .removeClass("hljs-number")
          .addClass("hljs-attr");
      }
    });

    const stringSpans = $("span.hljs-string");
    stringSpans.each((_idx, span) => {
      const spanNode = $(span);

      if (
        !span.prev ||
        !span.prev.prev ||
        !(span.prev.prev as any).firstChild ||
        (span.prev.prev as any).firstChild.data !== "!!str"
      ) {
        spanNode.removeClass("hljs-string").addClass("hljs-attr");
        return;
      }

      const text = spanNode.text();
      const newSpan = this.yamlService.highlightVariable(text, spanNode);
      if (newSpan !== spanNode) {
        spanNode.replaceWith(newSpan);
      }
    });

    return $.html();
  }
}
