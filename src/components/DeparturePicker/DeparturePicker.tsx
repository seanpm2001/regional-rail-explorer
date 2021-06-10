import React from "react";

import { useViewport } from "hooks";
import { NetworkTime, NetworkTimeRange } from "types";
import { DAY, roundToNearestHour } from "time";
import { FrequencyTimeline } from "components";

import DeparturePickerDesktop from "./DeparturePickerDesktop";
import DeparturePickerMobile from "./DeparturePickerMobile";
import { DeparturePickerImplProps } from "./types";

interface Props {
    enhancedArrivals: NetworkTime[];
    baselineArrivals: NetworkTime[];
    spanFullDay?: boolean;
    timePadding?: number;
    disabled?: boolean;
    time: number | null;
    onSelectTime: (time: number) => unknown;
    showArrivals?: boolean;
}

const getTimeRange = (
    allArrivals: NetworkTime[],
    spanFullDay: boolean,
    padding: number
): NetworkTimeRange => {
    if (spanFullDay) {
        return [0 - padding, DAY + padding];
    }
    let min = Infinity;
    let max = -Infinity;
    allArrivals.forEach((time) => {
        min = Math.min(time, min);
        max = Math.max(time, max);
    });
    return [roundToNearestHour(min) - padding, roundToNearestHour(max) + padding];
};

const DeparturePicker = (props: Props) => {
    const {
        baselineArrivals,
        enhancedArrivals,
        spanFullDay = false,
        timePadding = 0,
        disabled = false,
        time,
        onSelectTime,
        showArrivals = true,
    } = props;

    const { viewportWidth } = useViewport();

    const timeRange = getTimeRange(
        [...baselineArrivals, ...enhancedArrivals],
        spanFullDay,
        timePadding
    );

    if (viewportWidth === null) {
        return null;
    }

    const implProps: DeparturePickerImplProps = {
        timeRange,
        time,
        onSelectTime,
        disabled,
        timeline: (
            <FrequencyTimeline
                baselineArrivals={baselineArrivals}
                enhancedArrivals={enhancedArrivals}
                timeRange={timeRange}
                showArrivals={showArrivals}
            />
        ),
    };

    if (viewportWidth > 700) {
        return <DeparturePickerDesktop {...implProps} />;
    }
    return <DeparturePickerMobile {...implProps} time={time || 0} />;
};

export default DeparturePicker;
