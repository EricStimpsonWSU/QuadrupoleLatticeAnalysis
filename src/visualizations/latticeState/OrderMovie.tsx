import cv from '@techstark/opencv-js';

function readFlips() {
    const img = cv.imread('#flipsData');
}

export default function OrderMovie() {
    return (
        <>
            {' '}
            <img id="flipsData" src="./data/flips.png" alt=""></img>
            <p>OpenCV</p>
            {Object.keys(cv).forEach((element) => (
                <p>{element.toString()}</p>
            ))}
        </>
    );
}
