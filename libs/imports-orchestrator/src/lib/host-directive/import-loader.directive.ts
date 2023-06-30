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

  private running = 0;

  public async ngAfterViewInit(): Promise<void> {
    if (!ImportsOrchestratorLoaderDirective.processing) {
      // do not await, as it would block the lifecycle callback from completing until the queue is processed
      ImportsOrchestratorLoaderDirective.processing = true;

      await this.processQueue();

      this.config.logger.debug('queue processing ended');
      ImportsOrchestratorLoaderDirective.processing = false;
    }
  }

  private processQueue(pid: number = 0): Promise<void> {
    return new Promise<void>((resolve) => {
      const currentBatch: Promise<void>[] = [];
      for (let i = this.running; i < this.config.parallel; i++) {
        this.running++;
        currentBatch.push(
          processImportItem(pid++, this.config, this.router)
            .then(() => {
              this.config.logger.debug(
                `Queue resolved item, concurrent now ${this.running}`
              );
            })
            .finally(() => {
              this.running--;
              if (this.config.queue.length !== 0) {
                this.processQueue(pid++).then(() => {
                  resolve();
                });
              } else if (this.running === 0) {
                resolve();
              }
            })
        );
      }
      this.config.logger.debug(
        `Queue starting batch with ${currentBatch.length}, concurrent now ${this.running}`
      );
    });
  }
}
