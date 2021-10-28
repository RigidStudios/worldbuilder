import { labels } from "index.client";

type DataLabel = {
	labels: string[],
	text: string,
	position: Vector3
}

export type InfoLabel = {
	name: string,
	color: Color3
}

export type Label = {
	labels: string[],
	title: string,
	text: string,
	position: Vector3,
	Color: Color3,
	instance: Part,
	ui: BillboardGui
}

type LabelUpdate = 'labels'|'name'|'color';
type InfoLabelUpdate = 'add'|'remove'|'change';


export class Data {
    infoLabels: InfoLabel[] = [ { name: 'todo', color: new Color3(.7, 0, .9) }, { name: 'task', color: new Color3(.2, 0, .7) }, { name: 'wip', color: new Color3(.7, .3, 0) } ];
    defaultLabels: string[] = [ 'task' ];

    createInfoLabel(name: string, color: Color3) {
        this.infoLabels.push({
            name,
            color
        });
    }

    toggleLabelDefault(name: string) {
        if (this.defaultLabels.includes(name)) {
            this.defaultLabels.remove(this.defaultLabels.findIndex(v => v === name));
            return false;
        } else {
            this.defaultLabels.push(name);
            return true;
        }
    }
    isLabelDefault(name: string) {
        return this.defaultLabels.includes(name);
    }

    listeningForLabel: (() => void)[] = [];
    listeningForChange: Map<Label, ((typ: LabelUpdate) => void)[]> = new Map();
    labelChanged(label: Label, cb: (typ: LabelUpdate) => void) {
        let store = this.listeningForChange.get(label) || this.listeningForChange.set(label, []).get(label);

        store?.push(cb);
    }
    infoLabelChanged(cb: () => void) {
        this.listeningForLabel.push(cb);
    }

    triggerLabels(label: Label, typ: LabelUpdate) {
        this.listeningForChange.get(label)?.forEach(v => {
            try {
                v(typ);
            } catch (e) { print('Encountered error when triggering @', label.title) };
        });
    }
    triggerInfoLabel() {
        this.listeningForLabel.forEach(v => v());
    }

    changeLabel(label: Label, typ: LabelUpdate, n: unknown) {
        switch(typ) {
            case 'labels':
                if (label.labels.includes(n as string)) {
                    label.labels.remove(label.labels.findIndex(v => n === v))
                } else {
                    label.labels.push(n as string);
                }

                this.triggerLabels(label, typ);

                break;
            case 'name':
                label.title = n as string;

                print('updating.')

                this.triggerLabels(label, typ);

                break;
        }
    }
    changeInfoLabel(typ: InfoLabelUpdate, n: unknown) {
        switch(typ) {
            case 'add':
                this.infoLabels.push(n as InfoLabel);

                this.triggerInfoLabel();

                break;
            case 'remove':
                this.infoLabels.remove(n as number);

                this.triggerInfoLabel();

                break;
            case 'change':
                let r = n as { i: number, k: 'name', v: string }; // These types aren't true.
                if (this.infoLabels[r.i]) {
                    this.infoLabels[r.i][r.k] = r.v;
                }
                
                this.triggerInfoLabel();

                break;
        }
    }
}