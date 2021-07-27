import * as feather from "feather-icons";
import { addIcon } from "obsidian";

export function addFeatherIcons(iconList: string[]) {
    Object.values(feather.icons).forEach((i) => {
        const svg = i.toSvg({viewBox: "0 0 24 24", width: "100", height: "100"});
        //Remove the svg tag: svg.match(/(?<=>).*(?=<\/svg>)/).first()
        addIcon("feather-" + i.name, svg);
        iconList.push("feather-" + i.name);
    });
}