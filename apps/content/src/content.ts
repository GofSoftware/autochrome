import './html/content.less';
import { AutoActionContentWorker } from './action-worker/auto-action-content-worker';

AutoActionContentWorker.instance().start();
