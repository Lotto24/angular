# Defer-Queue for Angular

## Usage

### App configuration

In your App config, provide the defer queue:

```
export const appConfig = {
  providers: [
    provideRouter(
      appRoutes,
    ),
    provideDeferQueue(),
  ],
};
```

### Component
In your component, inject the defer queue service

```
@Component({...})
export class SomeComponent {
  protected readonly deferQueue = inject(DeferQueueService);
}
```

### Template

1. in your component's template, use the defer queue's trigger. 
2. add an identifier for this item. This improves logging, but it is also needed for the queue to work. You should also set a priority for this defer block.
3important: add the directive `[deferQueueResolve]` to your deferred component. The value should match the previous identifier. This will signal to the queue when the defer block is resolved.   

```
@defer (when deferQueue.when('fruit0', 'lowest')) {
  <imports-orchestrator-examples-fruit0-component deferQueueResolve="fruit0" />
}
```
