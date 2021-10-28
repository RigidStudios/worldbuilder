import { RunService } from "@rbxts/services";

type AttributeConditions = Map<Instance, string[]>;
type OptionalAttributeConditions = Map<Instance, string[]>; 

type HoverEffect = {
    cond: AttributeConditions,
    o_cond: OptionalAttributeConditions,
    instance: Instance,
    mod: (instance: Instance, bool: boolean) => [string, number][],
}

export class ElementEffects {
    hoverEffects: HoverEffect[] = [];

    static killMe(v: any): v is {[key: string]: unknown} {
        return true;
    }

    constructor() {
        RunService.RenderStepped.Connect(() => {
            this.hoverEffects.forEach(v => {
                // TODO: Eh, clean this up?
                v.mod(v.instance, this.matchesCond(v.cond, v.o_cond)).forEach(([ s, n ]) => {
                    let u = v.instance;
                    if (!ElementEffects.killMe(u)) return;
                    if (typeOf(n) === 'number') {
                        let r = u[s] as unknown as number;
                        u[s] = (r + (n - r) * 0.26);
                    } else {
                        u[s] = (u[s] as Vector3).Lerp(n as unknown as Vector3, 0.26);
                    }
                });
            });
        });
    }

    static visibleText(back: Color3) {
        let [r, g, b] = [back.R * 255, back.G * 255, back.B * 255];
        return (1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255) < 0.5 ? new Color3(0,0,0) : new Color3(1,1,1);
    }

    preHover(instance: GuiObject, subInstance: Frame) {
        (instance as Frame).Active = true;
        (instance as Frame).MouseEnter.Connect(() => subInstance.SetAttribute('Hover', true));
        (instance as Frame).MouseLeave.Connect(() => subInstance.SetAttribute('Hover', false));
    }

    hover(h: HoverEffect) {
        this.hoverEffects.push(h);
    }

    matchesCond(f: AttributeConditions, o: OptionalAttributeConditions) {
        let b = false;
        let canB = true;
        f.forEach((c, i) => {
            if (!canB) return;
            c.forEach(v => {
                if (!canB) return;
                if (i.GetAttribute(v)) { b = true } else { b = false; canB = false };
            });
        });
        o.forEach((c, i) => {
            c.forEach(v => {
                if (i.GetAttribute(v)) b = true;
            });
        });
        return b;
    }
};