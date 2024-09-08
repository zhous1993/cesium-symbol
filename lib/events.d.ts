import { EventType, EventListener } from './type';

export default class EventDispatcher {
    listeners: Map<EventType, Set<EventListener>>;
    constructor();
    on(event: EventType, listener: EventListener): void;
    off(event: EventType, listener: EventListener): void;
    dispatchEvent(event: EventType, eventData?: any): void;
}
