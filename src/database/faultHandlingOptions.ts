import { isRecoverableError } from 'etcd3';
import { Policy, ConsecutiveBreaker, ExponentialBackoff } from 'cockatiel';

/**
 * FaultHandlingOptions.
 */
const faultHandlingOptions = {
	faultHandling: {
		host: () => Policy.handleWhen(isRecoverableError).circuitBreaker(5000, new ConsecutiveBreaker(3)),
		global: Policy.handleWhen(isRecoverableError).retry().attempts(3),
		watchBackoff: new ExponentialBackoff()
	}
};
