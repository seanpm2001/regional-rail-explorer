import Heap from "heap";

import { Stop, NetworkDayTime, Station, Transfer } from "types";
import { compareTimes, stringifyTime, matchDayOfWeek } from "time";
import { NavigationFailedError } from "errors";

import { NavigationState, StopNavigationState } from "./types";
import { summarizeState } from "./util";

const getSuccessorStatesFromStop = (
    state: NavigationState,
    location: Stop,
    dayTime: NetworkDayTime,
    goal: Station,
    fromTransfer?: Transfer,
    excludeRouteId?: string
): StopNavigationState[] => {
    const { seen, parents } = state;
    const { stopTimes } = location;
    const searchTime: NetworkDayTime = {
        day: dayTime.day,
        time: dayTime.time + (fromTransfer ? fromTransfer.minWalkTime : 0),
    };
    const boardableStopTimes = stopTimes.filter((stopTime) => {
        return (
            stopTime.trip.serviceDays.some((day) => matchDayOfWeek(day, searchTime.day)) &&
            stopTime.time >= searchTime.time &&
            stopTime.trip.routeId !== excludeRouteId
        );
    });
    const nextStopTimeForEachServiceAndDirection = ["0", "1"]
        .map((directionId) =>
            location.serviceIds.map((serviceId) =>
                boardableStopTimes.find(
                    (stopTime) =>
                        stopTime.trip.serviceId === serviceId &&
                        stopTime.trip.directionId === directionId
                )
            )
        )
        .flat()
        .filter((x) => x);

    return nextStopTimeForEachServiceAndDirection
        .map((boardingStopTime) => {
            const { trip, time } = boardingStopTime;
            const validStopsTimesOnTrip = trip.stopTimes.filter((stopOnSameTrip) => {
                const isInFuture = compareTimes(stopOnSameTrip.time, time) > 0;
                const isUsefulStop =
                    stopOnSameTrip.stop.parentStation === goal ||
                    stopOnSameTrip.stop.serviceIds.length > 1;
                return isInFuture && isUsefulStop && !seen.has(stopOnSameTrip.stop);
            });
            return validStopsTimesOnTrip.map((alightingStopTime) => {
                return {
                    fromTransfer,
                    type: "stop" as const,
                    stop: alightingStopTime.stop,
                    trip: trip,
                    seen: new Set([...seen, alightingStopTime.stop]),
                    parents: [...parents, state],
                    departPreviousStopTime: {
                        day: dayTime.day,
                        time: boardingStopTime.time,
                    },
                    arriveAtThisStopTime: {
                        day: dayTime.day,
                        time: alightingStopTime.time,
                    },
                    dayTime: {
                        day: dayTime.day,
                        time: alightingStopTime.time,
                    },
                };
            });
        })
        .flat();
};

const getSuccessorStates = (state: NavigationState, goal: Station): NavigationState[] => {
    const { dayTime } = state;
    if (state.type === "start") {
        const { station } = state;
        return station.stops
            .map((stop) => getSuccessorStatesFromStop(state, stop, dayTime, goal, null))
            .flat();
    }
    if (state.type === "stop") {
        const { stop, trip } = state;
        const { parentStation } = stop;
        const isRegionalRailTerminus =
            parentStation.id === "place-north" || parentStation.id === "place-sstat";
        const fromSameStop = isRegionalRailTerminus
            ? getSuccessorStatesFromStop(state, stop, dayTime, goal, null, trip.routeId)
            : [];
        const fromTransfer = stop.transfers
            .map((transfer) => {
                const { toStop } = transfer;
                return getSuccessorStatesFromStop(state, toStop, dayTime, goal, transfer);
            })
            .flat();
        return [...fromSameStop, ...fromTransfer];
    }
};

const createInitialState = (station: Station, dayTime: NetworkDayTime): NavigationState => {
    return {
        type: "start",
        seen: new Set(),
        station: station,
        dayTime: dayTime,
        parents: [],
    };
};

const getBestStatesFromHeap = (heap: any): NavigationState[] => {
    const firstState = heap.pop();
    const equallyGoodStates: NavigationState[] = [firstState];
    while (!heap.empty() && heap.peek().dayTime.time === firstState.dayTime.time) {
        equallyGoodStates.push(heap.pop());
    }
    return equallyGoodStates.sort((a, b) => a.parents.length - b.parents.length);
};

const printTripFromState = (navState: NavigationState) => {
    [...navState.parents, navState].forEach((state) => {
        // eslint-disable-next-line no-undef
        console.log(
            stringifyTime(state.dayTime.time),
            state.type === "start"
                ? state.station.name
                : [state.stop.parentStation.name, state.trip.serviceId, state.trip.id].join(" ")
        );
    });
};

export const navigateBetweenStations = (
    origin: Station,
    goal: Station,
    startTime: NetworkDayTime
) => {
    const initialState = createInitialState(origin, startTime);
    const stateHeap: Heap<NavigationState> = new Heap((a, b) => a.dayTime.time - b.dayTime.time);
    const visited = new Set<Station>([origin]);
    stateHeap.push(initialState);
    while (!stateHeap.empty()) {
        const nextBestStates = getBestStatesFromHeap(stateHeap);
        for (const state of nextBestStates) {
            // console.log("exploring", summarizeState(state));
            if (state.type === "stop") {
                visited.add(state.stop.parentStation);
            }
            if (state.type === "stop" && state.stop.parentStation === goal) {
                printTripFromState(state);
                return state;
            }
            getSuccessorStates(state, goal)
                .filter((state) => state.type === "start" || !visited.has(state.stop.parentStation))
                .forEach((newState) => stateHeap.push(newState));
        }
    }
    throw new NavigationFailedError();
};
