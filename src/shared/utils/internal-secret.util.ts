import { timingSafeEqual } from 'crypto';

export function verifyInternalSecret(
  provided: string | undefined | null,
  expected: string | undefined | null,
): boolean {
  const received = provided?.trim();
  const configured = expected?.trim();

  if (!received || !configured) return false;

  const receivedBuf = Buffer.from(received, 'utf8'); // chuyển thành file nhi phân
  const configuredBuf = Buffer.from(configured, 'utf8');

  if (receivedBuf.length !== configuredBuf.length) return false;

  return timingSafeEqual(receivedBuf, configuredBuf); // như === nhưng an toàn vì thời gian trả về như nhau nhưng phải là file nhị phân mới đc
}
