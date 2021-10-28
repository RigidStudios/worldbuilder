import { UserInputService, Workspace } from "@rbxts/services";
import { Data, Label } from "Data";
import { ElementEffects } from "UICode";


const theme = settings().Studio.Theme

let isCopying = false;

class TopElement {
    static isOpen = false;
    static openElement?: Instance;
    static container?: Instance;
    static lastClosed: number = os.clock();
    static hasElementOpen() {
        return (os.clock() - this.lastClosed) < .1 || this.isOpen;
    }
    static closeExistingElement() {
        if (this.hasElementOpen()) {
            this.openElement?.Destroy();
            this.isOpen = false;
            this.lastClosed = os.clock();
        }
    }

    static createTopLayer(mainLayer: DockWidgetPluginGui) {
        let container = this.container = new Instance('Frame');
        container.Parent = mainLayer;
        container.Size = new UDim2(1,0,1,0);
        container.BackgroundTransparency = 1;

        let padding = new Instance('UIPadding');
        padding.PaddingBottom = new UDim(0, 4);
        padding.PaddingTop = new UDim(0, 4);
        padding.PaddingLeft = new UDim(0, 4);
        padding.PaddingRight = new UDim(0, 4);
        padding.Parent = container;
    }

    open(i: Frame) {
        this.useTopLayer(i);
        TopElement.openElement = i;
        TopElement.isOpen = true;
    }

    close() {
        TopElement.closeExistingElement();
    }

    useTopLayer(instance: Instance) {
        instance.Parent = TopElement.container;
    }
}

class CopyElement extends TopElement {
    constructor(public instance: GuiObject, public Dock: DockWidgetPluginGui, public url: string) {
        super();

        instance.InputBegan.Connect(inp => {
            if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;
            if (TopElement.hasElementOpen()) return;

            let container = new Instance('Frame');
            container.Size = new UDim2(1,0,0,50);
            container.Position = new UDim2(0,0,1,-50);
            container.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.ViewPortBackground);
            container.BorderSizePixel = 0;

            let padding = new Instance('UIPadding');
            padding.PaddingLeft = new UDim(0, 4);
            padding.PaddingRight = new UDim(0, 4);
            padding.PaddingTop = new UDim(0, 4);
            padding.PaddingBottom = new UDim(0, 2);
            padding.Parent = container;
            
            let box = new Instance('TextBox');
            box.Parent = container;
            box.Size = new UDim2(1,0,1,-22);
            box.TextScaled = true;
            box.Text = url;
            box.ClearTextOnFocus = false;
            box.TextEditable = false;
            box.CaptureFocus();
            box.SelectionStart = 0;
            box.CursorPosition = box.Text.size() + 1;
            box.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBackground);
            box.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText);
            box.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBorder);

            padding = new Instance('UIPadding');
            padding.PaddingLeft = new UDim(0, 2);
            padding.PaddingRight = new UDim(0, 2);
            padding.PaddingTop = new UDim(0, 2);
            padding.PaddingBottom = new UDim(0, 2);
            padding.Parent = box;

            let ctrl = new Instance('TextLabel');
            ctrl.Parent = container;
            ctrl.Size = new UDim2(1,0,0,20);
            ctrl.Position = new UDim2(0,0,1,-20);
            ctrl.Text = 'CTRL+C - Click here to Close';
            ctrl.Font = Enum.Font.SourceSans;
            ctrl.BackgroundTransparency = 1;
            ctrl.TextScaled = true;
            ctrl.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.DimmedText);

            this.open(container);

            let u: RBXScriptConnection;
            u = ctrl.InputBegan.Connect(inp => {
                if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;

                this.close();
                u.Disconnect();
            });
        });
    }
}

class SelectElement<T> extends TopElement {
    constructor(public instance: GuiObject, public Data: Data, public options: { color: Color3, name: string }[], public callback: (optionName: string, optionVal: T) => void, public label: Label) {
        super();

        instance.InputBegan.Connect(inp => {
            if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;
            if (TopElement.hasElementOpen()) return;

            let container = new Instance('Frame');
            container.Size = new UDim2(1,0,0,50);
            container.Position = new UDim2(0,0,1,-50);
            container.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.ViewPortBackground);
            container.BorderSizePixel = 0;

            let padding = new Instance('UIPadding');
            padding.PaddingLeft = new UDim(0, 4);
            padding.PaddingRight = new UDim(0, 4);
            padding.PaddingTop = new UDim(0, 4);
            padding.PaddingBottom = new UDim(0, 4);
            padding.Parent = container;
            
            let box = new Instance('Frame');
            box.Parent = container;
            box.Size = new UDim2(1,0,1,-22);
            box.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBackground);
            box.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBorder);

            let list = new Instance('UIListLayout');
            list.Parent = box;
            list.FillDirection = Enum.FillDirection.Horizontal;
            list.Padding = new UDim(0, 4);

            options.forEach((u, v) => {
                let option = new Instance('TextLabel');
                option.Parent = box;
                option.Text = u.name;
                option.Size = new UDim2(0,30,1,0);
                option.BackgroundColor3 = u.color;
                option.TextColor3 = ElementEffects.visibleText(u.color);

                // TODO: implement callback

                option.InputBegan.Connect((inp) => {
                    if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;

                    Data.changeLabel(label, 'labels', u.name);
                });
            });

            padding = new Instance('UIPadding');
            padding.PaddingLeft = new UDim(0, 2);
            padding.PaddingRight = new UDim(0, 2);
            padding.PaddingTop = new UDim(0, 2);
            padding.PaddingBottom = new UDim(0, 2);
            padding.Parent = box;

            let ctrl = new Instance('TextLabel');
            ctrl.Parent = container;
            ctrl.Size = new UDim2(1,0,0,20);
            ctrl.Position = new UDim2(0,0,1,-20);
            ctrl.Text = 'Click here to Close';
            ctrl.Font = Enum.Font.SourceSans;
            ctrl.BackgroundTransparency = 1;
            ctrl.TextScaled = true;
            ctrl.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.DimmedText);

            this.open(container);

            let u: RBXScriptConnection;
            u = ctrl.InputBegan.Connect(inp => {
                if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;

                this.close();
                u.Disconnect();
            });
        });
    }
}

export class MainMenu {
    main: Frame;
    topBar: Frame;
    currentTab: string = '';
    lastEdited: [Label?] = [];


    constructor(public Dock: DockWidgetPluginGui, public plugin: Plugin, public Data: Data) {
        
        let background = new Instance('Frame');
        background.Parent = Dock;
        background.Size = new UDim2(1,0,1,-20);
        background.Position = new UDim2(0,0,0,20);
        background.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainBackground);
        background.BorderSizePixel = 0;
        this.main = background;

        let topBar = this.topBar = new Instance('Frame');
        topBar.Parent = Dock;
        topBar.Size = new UDim2(1,0,0,20);
        topBar.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainBackground);

        TopElement.createTopLayer(Dock);

        [['Help', 'welcome'],['Edit', 'edit', this.lastEdited],['Labels', 'labels']].forEach(([n, id, data], l) => {
            let i = new Instance('TextButton');
            i.Parent = topBar;
            i.Position = new UDim2((l) * 0.333, 0, 0, 1);
            i.Size = new UDim2(.333,0,1,0);
            i.Text = n as string;
            i.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.TitlebarText);
            i.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.Titlebar);
            i.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.Border);
            i.MouseButton1Click.Connect(() => {
                TopElement.closeExistingElement();

                if (id === 'edit') {
                    this.editLabel((data as [Label])[0]);
                } else this.useTab(id as 'welcome');
            });
        });

        this.useTab('welcome');
    }

    hasUsed() {
        let b = this.plugin.GetSetting('hasBeenUsed--test');
        this.plugin.SetSetting('hasBeenUsed--test', true);
        return this.plugin.GetSetting('hasBeenUsed--test');
    }

    editLabel(label: Label) {
        if (!label) return;
        this.setTitle(`Editing ${label.title}`);
        
        this.lastEdited[0] = label;

        // TODO: Label editing.

        this.useTab('edit', { label });
    }

    useTab(name: 'welcome'): void;
    useTab(name: 'edit', _data: { 
        label: Label
    }): void;
    useTab(name: 'refresh'): void;
    useTab(name: 'labels'): void;

    useTab(name: 'welcome'|'edit'|'refresh'|'labels', _data?: unknown) {
        if (this.currentTab === name) return; // To keep dumb things from happening.

        this.clearTab();

        if (name === 'refresh') {
            let loading = new Instance('TextLabel');
            loading.Parent = this.main;
            loading.Size = new UDim2(1,0,0,30); 
            loading.Font = Enum.Font.SourceSansBold;
            loading.TextScaled = true;
            loading.Text = 'Loading.';
            loading.BackgroundTransparency = 1;
            loading.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText);
            loading.Position = new UDim2(0,0,0,0);
        } else if (name === 'welcome') {
            this.setTitle('Welcome!');

            let t = this.hasUsed() ? 'Thank you for using worldbuilder!' : 'Welcome!';

            let welcome = new Instance('TextLabel');
            welcome.Parent = this.main;
            welcome.Size = new UDim2(1,0,0,30); 
            welcome.Font = Enum.Font.SourceSansBold;
            welcome.TextScaled = true;
            welcome.Text = t;
            welcome.BackgroundTransparency = 1;
            welcome.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText);
            welcome.Position = new UDim2(0,0,0,0);

            let padding = new Instance('UIPadding');
            padding.PaddingTop = new UDim(0, 2);
            padding.PaddingLeft = new UDim(0, 5);
            padding.PaddingRight = new UDim(0, 5);
            padding.Parent = welcome;

            let info = new Instance('TextLabel');
            info.Parent = this.main;
            info.Size = new UDim2(1,0,0,20);
            info.Position = new UDim2(0, 0, 1, -30);
            info.Font = Enum.Font.SourceSansSemibold;
            info.TextScaled = true;
            info.Text = 'Developed by RigidStudios · v0.1 · DevForum';
            info.BackgroundTransparency = 1;
            info.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.SubText);

            new CopyElement(info, this.Dock, 'https://google.com');

            padding = new Instance('UIPadding');
            padding.PaddingLeft = new UDim(0, 15);
            padding.PaddingRight = new UDim(0, 15);
            padding.Parent = info;
        } else if (name === 'edit')  {
            print(_data);
            let data = _data as { 
                label: Label
            };

            this.setTitle(`Editing ${data.label.title}`);

            let title = new Instance('TextLabel');
            title.Parent = this.main;
            title.Size = new UDim2(1,0,0,20); 
            title.Font = Enum.Font.SourceSansBold;
            title.TextScaled = true;
            title.Text = data.label.title;
            title.BackgroundTransparency = 1;
            title.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText);
            title.Position = new UDim2(0,0,0,0);

            this.Data.labelChanged(data.label, () => {
                title.Text = data.label.title;
                this.setTitle(`Editing ${data.label.title}`);
            });

            let padding = new Instance('UIPadding');
            padding.PaddingTop = new UDim(0, 2);
            padding.PaddingLeft = new UDim(0, 5);
            padding.PaddingRight = new UDim(0, 5);
            padding.Parent = title;

            let labelsHolder = new Instance('Frame');
            labelsHolder.Parent = this.main;
            labelsHolder.Size = new UDim2(1,-30,0,20);
            labelsHolder.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBackground);
            labelsHolder.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBorder);
            labelsHolder.Position = new UDim2(0,15,0,50);

            padding = new Instance('UIPadding');
            padding.PaddingLeft = new UDim(0, 2);
            padding.PaddingRight = new UDim(0, 2);
            padding.PaddingTop = new UDim(0, 2);
            padding.PaddingBottom = new UDim(0, 2);
            padding.Parent = labelsHolder;

            let list = new Instance('UIListLayout');
            list.FillDirection = Enum.FillDirection.Horizontal;
            list.Padding = new UDim(0, 2);
            list.Parent = labelsHolder;

            let w = () => {
                labelsHolder.GetChildren().forEach(v => { if (v.IsA('TextLabel')) v.Destroy() });
                data.label.labels.forEach(v => {
                    let label = new Instance('TextLabel');
                    label.Size = new UDim2(0, 30, 1, 0);
                    label.Parent = labelsHolder;
                    label.Text = v;
                    label.TextScaled = true;
                    let lc = this.Data.infoLabels.find(x => x.name === v)?.color || new Color3()
                    label.BackgroundColor3 = lc;
                    label.TextColor3 = ElementEffects.visibleText(lc);
                });
            }

            this.Data.labelChanged(data.label, () => w());
            this.Data.infoLabelChanged(() => w());

            w();

            new SelectElement(labelsHolder, this.Data, this.Data.infoLabels, () => {}, data.label);
        } else if (name === 'labels') {
            this.setTitle('Editing Labels');

            let title = new Instance('TextLabel');
            title.Parent = this.main;
            title.Size = new UDim2(1,0,0,20); 
            title.Font = Enum.Font.SourceSansBold;
            title.TextScaled = true;
            title.BackgroundTransparency = 1;
            title.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText);
            title.Position = new UDim2(0,0,0,0);
            title.Text = 'Labels'



            let padding = new Instance('UIPadding');
            padding.PaddingTop = new UDim(0, 2);
            padding.PaddingLeft = new UDim(0, 5);
            padding.PaddingRight = new UDim(0, 5);
            padding.Parent = title;

            let labelsHolder = new Instance('Frame');
            labelsHolder.Parent = this.main;
            labelsHolder.Size = new UDim2(1,-30,0,20);
            labelsHolder.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBackground);
            labelsHolder.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBorder);
            labelsHolder.Position = new UDim2(0,15,0,50);
            labelsHolder.AutomaticSize = Enum.AutomaticSize.Y;

            // TODO: decide whether or not to use this:
            // padding = new Instance('UIPadding');
            // padding.PaddingLeft = new UDim(0, 2);
            // padding.PaddingRight = new UDim(0, 2);
            // padding.PaddingTop = new UDim(0, 2);
            // padding.PaddingBottom = new UDim(0, 2);
            // padding.Parent = labelsHolder;

            let list = new Instance('UIListLayout');
            list.FillDirection = Enum.FillDirection.Vertical;
            // list.Padding = new UDim(0, 2);
            list.Parent = labelsHolder;

            let w = () => {
                labelsHolder.GetChildren().forEach(v => { if (v.IsA('Frame')) v.Destroy(); });
                this.Data.infoLabels.forEach((v) => { // I don't do index here as things can be removed and it doesn't stay true.
                    let infoLabelHolder = new Instance('Frame');
                    infoLabelHolder.Parent = labelsHolder;
                    infoLabelHolder.Size = new UDim2(1,0,0,20);
                    infoLabelHolder.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBackground);
                    infoLabelHolder.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBorder);
                    let infoLabelName = new Instance('TextBox');
                    infoLabelName.Parent = infoLabelHolder;
                    infoLabelName.Size = new UDim2(1,-40,1,0);
                    infoLabelName.Position = new UDim2(0,20,0,0);
                    infoLabelName.BackgroundTransparency = 1;
                    infoLabelName.Text = v.name;
                    infoLabelName.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText)
                    infoLabelName.ClearTextOnFocus = false;
                    infoLabelName.FocusLost.Connect(() => {
                        this.Data.changeInfoLabel('change', { i: this.Data.infoLabels.findIndex(x => x === v), k: 'name', v: infoLabelName.Text });
                    });
                    let infoLabelColor = new Instance('Frame');
                    infoLabelColor.Parent = infoLabelHolder;
                    infoLabelColor.Size = new UDim2(0, 20, 0, 20);
                    infoLabelColor.Position = new UDim2(0,0,0,0);
                    infoLabelColor.BackgroundColor3 = v.color;
                    infoLabelColor.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.Border);
                    infoLabelColor.InputBegan.Connect((inp) => {
                        if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;
                        this.Data.changeInfoLabel('change', { i: this.Data.infoLabels.findIndex(x => x === v), k: 'color', v: Color3.fromHSV(math.random(), 1, 1)});
                    });
                    let infoLabelDefault = new Instance('TextLabel');
                    infoLabelDefault.Parent = infoLabelHolder;
                    infoLabelDefault.Size = new UDim2(0, 20, 0, 20);
                    infoLabelDefault.Position = new UDim2(1,-20,0,0);
                    infoLabelDefault.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.CheckedFieldBackground);
                    infoLabelDefault.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText)
                    infoLabelDefault.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.Border);
                    infoLabelDefault.Text = this.Data.isLabelDefault(infoLabelName.Text) ? 'D' : '';
                    infoLabelDefault.InputBegan.Connect((inp) => {
                        if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;
                        infoLabelDefault.Text = this.Data.toggleLabelDefault(infoLabelName.Text) ? 'D' : '';
                    });
                });
                let infoLabelHolder = new Instance('Frame');
                infoLabelHolder.Parent = labelsHolder;
                infoLabelHolder.Size = new UDim2(1,0,0,20);
                infoLabelHolder.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBackground);
                infoLabelHolder.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.InputFieldBorder);
                let infoLabelName = new Instance('TextBox');
                infoLabelName.Parent = infoLabelHolder;
                infoLabelName.Size = new UDim2(1,-40,1,0);
                infoLabelName.Position = new UDim2(0,20,0,0);
                infoLabelName.BackgroundTransparency = 1;
                infoLabelName.Text = 'new label';
                infoLabelName.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText);
                infoLabelName.ClearTextOnFocus = false;
                let infoLabelColor = new Instance('TextLabel');
                infoLabelColor.Parent = infoLabelHolder;
                infoLabelColor.Size = new UDim2(0, 20, 0, 20);
                infoLabelColor.Position = new UDim2(0,0,0,0);
                infoLabelColor.BackgroundColor3 = theme.GetColor(Enum.StudioStyleGuideColor.CheckedFieldBackground);
                infoLabelColor.TextColor3 = theme.GetColor(Enum.StudioStyleGuideColor.MainText);
                infoLabelColor.Text = '+';
                infoLabelColor.BorderColor3 = theme.GetColor(Enum.StudioStyleGuideColor.Border);
                infoLabelColor.InputBegan.Connect((inp) => {
                    if (inp.UserInputType !== Enum.UserInputType.MouseButton1) return;
                    this.Data.changeInfoLabel('add', {name: infoLabelName.Text, color: Color3.fromHSV(math.random(), 1, 1)});
                });
            }

            w();

            this.Data.infoLabelChanged(() => {
                w();
            });
        }
    }

    clearTab() {
        this.main.GetChildren().forEach(v => v.Destroy());
    }

    setTitle(s: string) {
        this.Dock.Title = s;
    }
}