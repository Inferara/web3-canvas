import { useEffect } from "react";
import { useAppDispatch } from "../../../../app/hooks";
import { CurrentPageState, setCurrentPage } from "../../../main-window/current-page-slice";
import { rebootCall } from "../../../../api/w3c/w3c-api";

type CanvasProps = {
    currentPageState: CurrentPageState;
};

export const useCanvas = (props: CanvasProps) => {
    const { currentPageState } = props;
    const dispatch = useAppDispatch();

    const reboot = async (): Promise<void> => {
        await rebootCall();
    };

      // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
    }, [dispatch]);

    return {
        reboot,
    };
};