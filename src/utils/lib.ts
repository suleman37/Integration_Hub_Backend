
/*
    export function isTokenAlive(conn) {
    return conn.identity()
    .then(() => true)
    .catch((err) => {
        if (err.errorCode === 'INVALID_SESSION_ID') return false;
        throw err;
    });
}
*/




export function timeToCron(timeStr: string): string | null {
    const [hoursStr, minutesStr] = timeStr.split(':');

    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Validate that both parts are legit numbers
    if (
        isNaN(hours) || isNaN(minutes) ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59
    ) {
        console.error('Invalid time format:', timeStr);
        return null;
    }

    return `${minutes} ${hours} * * *`;
}





