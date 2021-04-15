import React, { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";

import { stationsByLine, stationsById } from "stations";

import * as api from "api";
import { JourneyInfo, NetworkTime, NetworkDayKind, TimeOfDay, JourneyApiResult } from "types";
import { DeparturePicker, JourneyPicker, JourneyComparison, JourneyErrorState } from "components";
import { useRouterBoundState, usePendingPromise } from "hooks";

import styles from "./Explorer.module.scss";
import { getAdvantageousDepartureTime } from "./departures";

const scenarioIds = ["present", "phase_one"];

const Explorer = () => {
    const [{ fromStationId, toStationId, day, time }, updateJourneyParams] = useRouterBoundState(
        {
            fromStationId: {
                initial: null as string,
                param: "from",
            },
            toStationId: {
                initial: null as string,
                param: "to",
            },
            day: {
                initial: "weekday" as NetworkDayKind,
                param: "day",
            },
            time: {
                initial: null as number,
                param: "time",
                decode: parseInt,
                encode: (t) => t?.toString(),
            },
        },
        (previousState, nextState) => {
            return {
                shallow: true,
                replace:
                    previousState.fromStationId === nextState.fromStationId &&
                    previousState.toStationId === nextState.toStationId,
            };
        }
    );
    const [arrivals, setArrivals] = useState<NetworkTime[][]>(null);
    const [journeys, setJourneys] = useState<JourneyApiResult>(null);
    const [requestedTimeOfDay, setRequestedTimeOfDay] = useState<TimeOfDay>(null);
    const [isJourneyPending, wrapJourneyPending] = usePendingPromise();

    useEffect(() => {
        setArrivals(null);
        if (fromStationId && toStationId && day) {
            api.arrivals(fromStationId, toStationId, day, scenarioIds).then(setArrivals);
            if (!time) {
                setRequestedTimeOfDay("morning");
            }
        }
    }, [fromStationId, toStationId, day]);

    useEffect(() => {
        setJourneys(null);
        if (fromStationId && toStationId && day && time) {
            wrapJourneyPending(
                api.journeys(fromStationId, toStationId, day, time, scenarioIds).then(setJourneys)
            );
        }
    }, [fromStationId, toStationId, day, time]);

    useEffect(() => {
        if (requestedTimeOfDay && arrivals) {
            const [baselineArrivals, enhancedArrivals] = arrivals;
            const time = getAdvantageousDepartureTime(
                requestedTimeOfDay,
                baselineArrivals,
                enhancedArrivals
            );
            setRequestedTimeOfDay(null);
            updateJourneyParams({ time });
        }
    }, [requestedTimeOfDay, arrivals]);

    const renderDeparturePicker = () => {
        if (arrivals) {
            const [baselineArrivals, enhancedArrivals] = arrivals;
            return (
                <DeparturePicker
                    baselineArrivals={baselineArrivals}
                    enhancedArrivals={enhancedArrivals}
                    spanFullDay={false}
                    onSelectTime={(time) => updateJourneyParams({ time })}
                    time={time}
                    disabled={isJourneyPending}
                />
            );
        }
        return null;
    };

    const renderJourneyComparison = () => {
        if (isJourneyPending) {
            return (
                <div className={styles.spinnerContainer}>
                    <CgSpinner className="spinning" size={50} />
                </div>
            );
        }
        if (journeys) {
            const journeyResolvedWithError = journeys.find((j) => "error" in j);
            if (journeyResolvedWithError && "error" in journeyResolvedWithError) {
                const {
                    payload: { scenario },
                } = journeyResolvedWithError;
                return <JourneyErrorState scenarioWithError={scenario} />;
            }
            const [baseline, enhanced] = journeys as JourneyInfo[];
            return <JourneyComparison baseline={baseline} enhanced={enhanced} />;
        }
        return null;
    };

    return (
        <div className={styles.explorer}>
            <JourneyPicker
                disabled={isJourneyPending}
                time={time}
                day={day}
                stationsById={stationsById}
                stationsByLine={stationsByLine}
                fromStationId={fromStationId}
                toStationId={toStationId}
                onSelectJourney={updateJourneyParams}
                onSelectTimeOfDay={setRequestedTimeOfDay}
                onSelectDay={(day) => updateJourneyParams({ day })}
            />
            {renderDeparturePicker()}
            {renderJourneyComparison()}
        </div>
    );
};

export default Explorer;
