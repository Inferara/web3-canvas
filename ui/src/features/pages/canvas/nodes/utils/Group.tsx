import React from "react";
import { NodeProps } from "@xyflow/react";



interface GroupNodeProps extends NodeProps {
    id: string;
    data: {
        in?: string;
        out?: string;
    };
}

const Group: React.FC<GroupNodeProps> = ({ id }) => {

    return (
        <div id={id} itemType="group" style={{width: 500, height: 300}}>

        </div>
    );
};

export default Group;
