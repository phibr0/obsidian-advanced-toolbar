import * as feather from "feather-icons";
import { addIcon } from "obsidian";

export function addFeatherIcons() {
    Object.values(feather.icons).forEach((i) => {
        addIcon("feather-" + i.name, i.toSvg({viewBox: "0 0 24 24", width: "100", height: "100"}));
    });
}