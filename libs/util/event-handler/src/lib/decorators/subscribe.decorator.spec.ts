import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsString } from 'class-validator';
import EventEmitter from 'events';
import { Subscribe } from './subscribe.decorator';
import { EventDto } from '../dtos/event.dto';
import { EventSubscribeHandlerService } from '../../index';

describe('Subscribe', () => {
    let eventEmitter;
    let testService;
    let publishEventSubscriberServiceMock;
    const firstMethodSpy = jest.fn();
    const secondMethodSpy = jest.fn();
    const onModuleInitSpy = jest.fn();

    class FirstEvent extends EventDto {
        static type = 'first';

        @IsString()
        type = FirstEvent.type;
    }

    class SecondEvent extends EventDto {
        static type = 'second';

        @IsString()
        type = SecondEvent.type;
    }

    @Injectable()
    class TestService {
    	onModuleInit() {
    		onModuleInitSpy();
    	}

        @Subscribe(FirstEvent)
        firstMethod(event) {
    		firstMethodSpy(event);
    	}

        @Subscribe(SecondEvent)
        secondMethod(event) {
        	secondMethodSpy(event);
        }
    }

    beforeEach(async () => {
    	eventEmitter = new EventEmitter();

    	publishEventSubscriberServiceMock = { subscribe: (event, autoEmit, callback) => eventEmitter.on(event, callback) };

    	const module: TestingModule = await Test.createTestingModule({
    		providers: [
    			TestService,
    			{
    				provide: EventSubscribeHandlerService,
    				useValue: publishEventSubscriberServiceMock,
    			},
    		],
    	}).compile();

    	module.init();

    	testService = module.get<TestService>(TestService);
    });


    afterEach(() => {
    	eventEmitter.removeAllListeners();
    	jest.clearAllMocks();
    });

    it('should not override onModuleInit', () => {
    	expect(onModuleInitSpy).toHaveBeenCalled();
    });

    it('should subscribe method to publish event', async () => {
    	const event = { myEvent: true };

    	jest.spyOn(testService, 'firstMethod');

    	eventEmitter.emit(FirstEvent, event);

    	await new Promise(resolve => setImmediate(resolve));

    	expect(firstMethodSpy).toHaveBeenCalledWith(event);
    });

    it('should subscribe multiple methods to publish event', async () => {
    	const firstEvent = { myFistEvent: true };
    	const secondEvent = { mySecondEvent: true };

    	jest.spyOn(testService, 'firstMethod');

    	eventEmitter.emit(FirstEvent, firstEvent);
    	eventEmitter.emit(SecondEvent, secondEvent);

    	await new Promise(resolve => setImmediate(resolve));

    	expect(firstMethodSpy).toHaveBeenCalledTimes(1);
    	expect(firstMethodSpy).toHaveBeenCalledWith(firstEvent);

    	expect(secondMethodSpy).toHaveBeenCalledTimes(1);
    	expect(secondMethodSpy).toHaveBeenCalledWith(secondEvent);
    });
});
