import { RoutePage } from "components";
import Head from "next/head";

import { mapScenarios } from "server/scenarios";
import { SerializableRouteInfo } from "types";

interface Props {
    scenarios: string[];
    routeInfo: SerializableRouteInfo[];
}

export async function getServerSideProps(context) {
    const {
        params: { id },
    } = context;
    const scenarios = ["present", "regional_rail"];
    const routeInfo = mapScenarios(
        scenarios,
        (scenario) => scenario.network.regionalRailRouteInfo[id]
    );
    return {
        props: {
            routeInfo,
            scenarios,
        },
    };
}

export default function Route(props: Props) {
    return (
        <div>
            <Head>
                <title>Regional Rail Explorer</title>
            </Head>
            <RoutePage {...props} />
        </div>
    );
}
