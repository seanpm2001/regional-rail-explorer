import parse from "csv-parse/lib/sync";
import fs from "fs";
import path from "path";
import { camelize } from "@ridi/object-case-converter";

import {
    GtfsService,
    GtfsRoute,
    GtfsRoutePattern,
    GtfsTrip,
    GtfsStop,
    GtfsStopTime,
    GtfsTransfer,
    GtfsRoutePatternAmenities,
} from "types";

const loadCsv = <T>(filePath: string): T[] => {
    const contents = fs.readFileSync(filePath);
    const records = parse(contents, { delimiter: ",", columns: true });
    return records.map(camelize);
};

export const createGtfsLoader = (basePath: string) => {
    const resolvePath = (filename: string) => path.join(basePath, filename + ".txt");
    const reader = <T>(filename: string) => () => loadCsv<T>(resolvePath(filename));

    const optionalReader = <T>(filename: string) => {
        if (fs.existsSync(resolvePath(filename))) {
            return reader<T>(filename);
        }
        return null;
    };

    return {
        basePath,
        routes: reader<GtfsRoute>("routes"),
        routePatterns: reader<GtfsRoutePattern>("route_patterns"),
        trips: reader<GtfsTrip>("trips"),
        stops: reader<GtfsStop>("stops"),
        services: reader<GtfsService>("calendar"),
        stopTimes: reader<GtfsStopTime>("stop_times"),
        relevantStopTimes: reader<GtfsStopTime>("relevant_stop_times"),
        transfers: reader<GtfsTransfer>("transfers"),
        amenities: optionalReader<GtfsRoutePatternAmenities>("amenities"),
    };
};

export type GtfsLoader = ReturnType<typeof createGtfsLoader>;
