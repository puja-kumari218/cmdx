import { useTimer } from 'react-timer-hook';

export function MyTimer({ expiryTimestamp, text }) {
    const {
        seconds,
        minutes,
        hours,
        days,
    } = useTimer({ expiryTimestamp });
    return (
        <div >
            <b>{text} </b><b>{days}</b> <span>D</span> <b>{hours}</b> <span>H</span> <b>{minutes}</b> <span>M</span> <b>{seconds}</b> <span>S</span>
        </div>
    );
}