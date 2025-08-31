import { formatDistanceToNow } from 'date-fns';
export default function DateStringToDateFormat(dataString: string) {
    const date = new Date(dataString);

    const year = date.getUTCFullYear();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getUTCMonth()];
    const day = date.getUTCDate();

    let hour = date.getUTCHours();
    const minute = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert to 12-hour format

    return `${month} ${day}, ${year}, ${hour}:${minute} ${ampm}`;
}


export function DateStringToAgoFormat(dateString: string) {
    const date = new Date(dateString);

    // Shift the date by -7 hours
    const shiftedDate = new Date(date.getTime() - 7 * 60 * 60 * 1000);

    return formatDistanceToNow(shiftedDate, { addSuffix: true });
}

export function TodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}Z`;
}


export function getLocalISOString(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}