export function floatToStr(value, rounding = 2) {
    try {
        if (typeof value === 'number' && !Number.isInteger(value)) {
            value = value.toFixed(rounding); // округление до нужного количества знаков после запятой
        }

        let splitValue = value.toString().split('.');
        let beforeDot = splitValue[0].split('').reverse().join('');

        let updateBeforeDot = [];
        while (beforeDot) {
            updateBeforeDot.push(beforeDot.slice(0, 3));
            beforeDot = beforeDot.slice(3);
        }

        updateBeforeDot = updateBeforeDot.reverse().map(i => i.split('').reverse().join(''));
        let finalBeforeDotStr = updateBeforeDot.join(' ');

        let afterDot = splitValue[1] || '0';
        let zeroMax = '0'.repeat(rounding + 1);
        let zeroList = [];
        for (let i = 0; i < zeroMax.length; i++) {
            zeroList.push(zeroMax.slice(0, i));
        }

        let finalAfterDotStr = null;
        if (!zeroList.includes(afterDot.slice(0, rounding))) {
            finalAfterDotStr = afterDot.slice(0, rounding);
        }

        if (finalAfterDotStr) {
            return finalBeforeDotStr + ',' + finalAfterDotStr;
        } else {
            return finalBeforeDotStr;
        }
    } catch (error) {
        return false;
    }
}
