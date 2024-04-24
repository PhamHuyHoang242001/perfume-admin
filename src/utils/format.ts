import { DateValue } from '@mantine/dates';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);
export function formatDay(day: string | Date | undefined | DateValue) {
  return dayjs(day).format('L LT');
}
