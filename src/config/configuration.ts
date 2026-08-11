import appConfig from './app/app.config';
import databaseConfig from './database/database.config';
import throttlerConfig from './throttler/throttler.config';

// file tập hợp toàn bộ config trong dự
export const allConfigs = [appConfig, throttlerConfig, databaseConfig];
