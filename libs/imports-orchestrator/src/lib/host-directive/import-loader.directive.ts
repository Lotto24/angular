import type { AfterViewInit } from '@angular/core';
import { Directive, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { processImportQueue } from '../queue/process-import-queue';
import { ImportsOrchestratorConfig } from '../config/import.config';

@Directive({
  selector: '[importLoader]',
  standalone: true,
})
export class ImportsOrchestratorLoaderDirective implements AfterViewInit {
  private static processing = false;

  private config = inject(ImportsOrchestratorConfig);
  private router = inject(Router);
  private zone = inject(NgZone);

  public async ngAfterViewInit(): Promise<void> {
    if (!ImportsOrchestratorLoaderDirective.processing) {
      // do not await, as it would block the lifecycle callback from completing until the queue is processed
      this.zone.runOutsideAngular(async () => {
        ImportsOrchestratorLoaderDirective.processing = true;
        this.config.logger.debug(`queue processing started (parallel=${this.config.parallel})`);
        const processes = Array.from(Array(this.config.parallel)).map((_, pid) =>
          processImportQueue(pid, this.config.queue, this.router, this.config.logger)
        );
        await Promise.all(processes);

        ImportsOrchestratorLoaderDirective.processing = false;
        this.config.logger.debug('queue processing ended');
      });
    }
  }
}
