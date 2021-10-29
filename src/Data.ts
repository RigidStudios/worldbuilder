import { HttpService, ServerStorage } from "@rbxts/services";

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

export const labels: Label[] = []

export class Data {
    constructor(public plugin: Plugin) {};
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

    storeVersion = '1';
    storeConverter() {} // TODO: Convert from old versions to new versions of storage.
    saveEverything() {
        let PluginStorage = ServerStorage.FindFirstChild('worldbuilder_storage');
        let LabelStorage = PluginStorage?.FindFirstChild('labels');
        let LabelStore: StringValue = LabelStorage?.FindFirstChild(`main${this.storeVersion}`) as StringValue;
        let BackupStore: StringValue = LabelStorage?.FindFirstChild(`main${this.storeVersion}-b`) as StringValue;
        if (!PluginStorage) {
            PluginStorage = new Instance('Folder');
            PluginStorage.Parent = ServerStorage;
            PluginStorage.Name = 'worldbuilder_storage';

            LabelStorage = new Instance('Folder');
            LabelStorage.Parent = PluginStorage;
            LabelStorage.Name = 'labels';

            LabelStore = new Instance('StringValue');
            LabelStore.Parent = LabelStorage;
            LabelStore.Name = `main${this.storeVersion}`;
            LabelStore.Value = HttpService.GenerateGUID(true);

            BackupStore = new Instance('StringValue');
            BackupStore.Parent = LabelStorage;
            BackupStore.Name = `main${this.storeVersion}-b`;

            // TODO: Figure out what to do with the backup store.
        }
        
    }

    loadLabels() {

    }
}