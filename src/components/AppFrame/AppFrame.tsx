import React, { useRef } from "react";
import classNames from "classnames";
import Head from "next/head";
import { HiHome, HiChevronRight } from "react-icons/hi";

import { ModeSelect } from "components";
import { Mode } from "modes";

import styles from "./AppFrame.module.scss";
import { AppFrameContext } from "./AppFrameContext";

type Props = {
    breadcrumbs?: React.ReactNode[];
    children: React.ReactNode;
    containerClassName?: string;
    controls?: React.ReactNode;
    mode?: Mode;
};

const AppFrame = (props: Props) => {
    const {
        controls = null,
        breadcrumbs: providedBreadcrumbs = [],
        mode,
        children,
        containerClassName,
    } = props;
    const globalNavRef = useRef<null | HTMLDivElement>(null);

    const breadcrumbs = [
        <a href="/" key={0}>
            <HiHome size={20} />
        </a>,
        mode && <ModeSelect mode={mode} />,
        ...providedBreadcrumbs,
    ].filter((x) => x);

    return (
        <AppFrameContext.Provider value={{ globalNav: globalNavRef.current }}>
            <div className={styles.appFrame}>
                <Head>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0"
                    />
                    <title>Regional Rail Explorer</title>
                </Head>
                <div className={styles.globalNav} ref={globalNavRef}>
                    <div className={styles.breadcrumbs}>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div className={styles.breadcrumb} key={index}>
                                <span>{breadcrumb}</span>
                                {(index < breadcrumbs.length - 1 || controls) && (
                                    <HiChevronRight size={24} />
                                )}
                            </div>
                        ))}
                    </div>
                    {controls && <div className={styles.controls}>{controls}</div>}
                </div>
                <div className={classNames(styles.container, containerClassName)}>{children}</div>
            </div>
        </AppFrameContext.Provider>
    );
};

export default AppFrame;
