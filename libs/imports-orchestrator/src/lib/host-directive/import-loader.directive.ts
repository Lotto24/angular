import type { AfterViewInit } from '@angular/core';
import { Directive, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { processImportQueue as processImportItem } from '../queue/process-import-queue';
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
        this.config.logger.debug(
          `queue processing started (parallel=${this.config.parallel})`
        );
        let item = 0;
      
        while (this.config.queue.length > 0) {
          const currentBatch = [];
          for (let i = 0; i < this.config.parallel; i++) {
            currentBatch.push(processImportItem(item++,this.config, this.router));
          }
          await Promise.any(currentBatch);
        }


        let runningTasks = 0;
        while (
          this.config.queue.length > 0 ||
          this.config.parallel > runningTasks
        ) {
          const processes = Array.from(Array(this.config.parallel)).map(
            (_, pid) => {
              runningTasks++;
              processImportItem(pid, this.config, this.router);
            }
          );
          await Promise.all(processes);
          runningTasks--;
        }

        ImportsOrchestratorLoaderDirective.processing = false;
        this.config.logger.debug('queue processing ended');
      });
    }
  }
}
