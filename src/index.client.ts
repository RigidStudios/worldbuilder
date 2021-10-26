/// <reference types="@rbxts/types/plugin" />

import { RunService, TextService, UserInputService, Workspace } from "@rbxts/services";
import { ElementEffects } from "UICode";

export {};

const toolbar = plugin.CreateToolbar("MyToolbar");
const button = toolbar.CreateButton("MyButton", "", "");

const labels: Label[] = []

let enabled = false;
button.Click.Connect(() => {
	enabled = !enabled;
	// TODO: hide/show labels.
});

type ExpansionParameter<T> = {
	prop: string,
	attr: string,
	instance: GuiBase2d,
	t: T|(() => T),
	f: T|(() => T),
	lerp: boolean,
	extraConditions: string[]
}

type JustRunThis = {
	func: () => unknown,
	instance: Instance,
	prop: string,
	lerp: boolean
}

const Elements = new ElementEffects();

let expanders: ExpansionParameter<unknown>[] = [];
let runners: JustRunThis[] = [];

type CombinedUI = Frame|TextBox|BillboardGui;
function hover<T>(hInstance: Frame|TextBox, instance: CombinedUI, prop: string, t: T|(() => T), f: T|(() => T), extraConditions: string[], lerp = true) {
	hInstance.Active = true;
	instance.Active = true;
	hInstance.MouseEnter.Connect(() => {instance.SetAttribute('Hover', true)});
	hInstance.MouseLeave.Connect(() => {instance.SetAttribute('Hover', false)});

	expanders.push({
		prop,
		attr: 'Hover',
		instance,
		t,
		f,
		lerp,
		extraConditions
	});
}

function runMod(instance: CombinedUI, prop: string, func: () => void, lerp = true) {
	runners.push({instance, prop, func, lerp});
}

const Selection = game.GetService('Selection');

let selHas = () => {for (let [i, v] of pairs(Selection.Get())) {
	if (!v.IsA('BasePart')) return false;
} return true; }
Selection.SelectionChanged.Connect(() => { if (enabled && selHas()) Selection.Set([]) });

const verticalLabelSize = 34;
const padding = 3;
function createLabel(p: Vector3, titleText?: string) {
	let c = BrickColor.random().Color;
	// TODO: Use first sub-label color instead of random.

	let holder = new Instance('Part');
	holder.Position = p;
	holder.Parent = Workspace;
	holder.Transparency = 1;
	holder.Locked = true;


	let largeFrame = new Instance('BillboardGui');
	largeFrame.AlwaysOnTop = true;
	largeFrame.Parent = game.GetService('StarterGui');
	largeFrame.Adornee = holder;
	largeFrame.Size = new UDim2(0,verticalLabelSize - 10,0,verticalLabelSize - 10);
	largeFrame.Active = true;


	let mainFrame = new Instance('Frame');
	mainFrame.Parent = largeFrame;
	mainFrame.BackgroundColor3 = new Color3(1,1,1);
	mainFrame.Size = new UDim2(1,0,1,0);
	mainFrame.ClipsDescendants = true;
	largeFrame.SetAttribute('hasFocus', true);

	let i = 0;

	Elements.preHover(mainFrame, mainFrame);
	Elements.hover({
		instance: largeFrame,
		cond: new Map<Instance, string[]>([
			[ mainFrame, ['Hover'] ]
		]),
		o_cond: new Map<Instance, string[]>([
			[ largeFrame, ['hasFocus'] ]
		]),
		mod: (n, b) => {
			title.Text = title.Text.sub(0, 120);
			let u = (b ? new UDim2(
				0,
				math.max(
					160,
					TextService.GetTextSize(
					title.Text,
					21, Enum.Font.SourceSansLight,
					new Vector2(1000, 10)
					).X + verticalLabelSize + 24
				),
				0,
				(i > 40 || largeFrame.GetAttribute('hasFocus')) ? 120 : verticalLabelSize
			) : UDim2.fromOffset(verticalLabelSize, verticalLabelSize)) as unknown as number;
			return [[
				'Size',
				u
			]];
		}
	});

	let uiCorner = new Instance('UICorner');
	uiCorner.CornerRadius = new UDim(0, verticalLabelSize/2);
	uiCorner.Parent = mainFrame;
	
	let uiPadding = new Instance('UIPadding');
	uiPadding.PaddingBottom = new UDim(0, padding);
	uiPadding.PaddingTop = new UDim(0, padding);
	uiPadding.PaddingLeft = new UDim(0, padding);
	uiPadding.PaddingRight = new UDim(0, padding);
	uiPadding.Parent = mainFrame;

	let color = new Instance('Frame');
	color.BackgroundColor3 = c;
	color.Size = new UDim2(1,0,0,verticalLabelSize - padding * 2);
	color.Parent = mainFrame;

	let aspect = new Instance('UIAspectRatioConstraint');
	aspect.AspectRatio = 1;
	aspect.Parent = color;

	uiCorner = new Instance('UICorner');
	uiCorner.CornerRadius = new UDim(1);
	uiCorner.Parent = color;

	let title = new Instance('TextBox');
	title.ClipsDescendants = true;
	title.Parent = mainFrame;
	title.AnchorPoint = new Vector2(0, 0);
	title.Position = new UDim2(0, verticalLabelSize, 0, 0);
	title.Size = new UDim2(1, -verticalLabelSize , 0, verticalLabelSize - padding * 2);
	title.TextSize = 23;
	title.TextScaled = false;
	title.ClearTextOnFocus = false;
	title.Font = Enum.Font.SourceSansLight;
	title.TextColor3 = new Color3();
	title.TextYAlignment = Enum.TextYAlignment.Bottom;
	title.TextXAlignment = Enum.TextXAlignment.Left;
	title.BackgroundColor3 = new Color3(0.8,0.8,0.8)
	hover(title, title, 'BackgroundTransparency', 0, 1, [ 'hasFocus' ], false);
	title.SetAttribute('hasFocus', true);
	title.CaptureFocus();
	title.FocusLost.Connect(() => {
		i = 0;
		largeFrame.SetAttribute('hasFocus', false);
		title.SetAttribute('hasFocus', false);
	});
	title.Focused.Connect(() => {
		i += 1;
		largeFrame.SetAttribute('hasFocus', true);
		title.SetAttribute('hasFocus', true);
	});
	RunService.RenderStepped.Connect(() => { if (mainFrame.GetAttribute('Hover')) {i += 1} else {i = 0}; } );
	Elements.hover({
		instance: title,
		cond: new Map<Instance, string[]>([
			[title, ['Hover']]
		]),
		o_cond: new Map<Instance, string[]>([
			[title, ['hasFocus']]
		]),
		mod(b) {
			return [['BackgroundTransparency', b ? 0 : 1]];
		}
	})

	uiCorner = new Instance('UICorner');
	uiCorner.CornerRadius = new UDim(.8);
	uiCorner.Parent = title;

	uiPadding = new Instance('UIPadding');
	uiPadding.PaddingBottom = new UDim(0, 1);
	uiPadding.PaddingTop = new UDim(0, 5);
	uiPadding.PaddingLeft = new UDim(0, 5);
	uiPadding.PaddingRight = new UDim(0, 1);
	uiPadding.Parent = title;

	let line = new Instance('Frame');
	line.Position = new UDim2(0, verticalLabelSize / 2 - padding, 0, verticalLabelSize);
	line.Size = new UDim2(0, padding, 0, verticalLabelSize - padding * 4)
	line.BackgroundColor3 = new Color3(0.8,0.8,0.8);
	line.Parent = mainFrame;

	uiCorner = new Instance('UICorner');
	uiCorner.CornerRadius = new UDim(1);
	uiCorner.Parent = line;

	let labelContainer = new Instance('Frame');
	labelContainer.Position = new UDim2(0, verticalLabelSize, 0, verticalLabelSize);
	labelContainer.Size = new UDim2(1, -verticalLabelSize, 0, verticalLabelSize - padding * 4);
	labelContainer.Parent = mainFrame;
	labelContainer.BackgroundColor3 = new Color3(0.8,0.8,0.8);
	labelContainer.BorderSizePixel = 0;
	// labelContainer.ClipsDescendants = true;

	let scroller = new Instance('ScrollingFrame');
	scroller.Position = new UDim2(0, 0, 0, 0);
	scroller.Size = new UDim2(1, 0, 1, 0);
	scroller.Parent = labelContainer;
	scroller.BackgroundTransparency = 1;
	scroller.BorderSizePixel = 0;
	scroller.ScrollBarImageTransparency = 1;
	scroller.ScrollBarThickness = 0;
	scroller.ScrollingDirection = Enum.ScrollingDirection.X;
	// scroller.ClipsDescendants = true;
	scroller.CanvasSize = new UDim2(2,0,1,0);

	let list = new Instance('UIListLayout');
	list.HorizontalAlignment = Enum.HorizontalAlignment.Left;
	list.VerticalAlignment = Enum.VerticalAlignment.Top;
	list.FillDirection = Enum.FillDirection.Horizontal;
	list.Parent = scroller;
	list.Padding = new UDim(0, padding);

	Elements.preHover(labelContainer, labelContainer as unknown as Frame);
	Elements.hover({
		instance: labelContainer,
		cond: new Map<Instance, string[]>([
			[labelContainer, ['Hover']]
		]),
		o_cond: new Map<Instance, string[]>([
			[title, ['hasFocus']]
		]),
		mod(b) {
			return [['BackgroundTransparency', b ? 0 : 1]];
		}
	});

	([ ['todo', new Color3(.7, 0, .9)], ['task', new Color3(.2, 0, .7)] ] as [string, Color3][]).forEach(([n, c]) => {
		let lab = new Instance('TextLabel');
		lab.Parent = scroller;
		lab.Size = new UDim2(0, 32, 1, -3);
		lab.Text = n;
		lab.BackgroundColor3 = c;

		uiCorner = new Instance('UICorner');
		uiCorner.CornerRadius = new UDim(.8);
		uiCorner.Parent = lab;
	});

	uiCorner = new Instance('UICorner');
	uiCorner.CornerRadius = new UDim(.8);
	uiCorner.Parent = labelContainer;

	uiPadding = new Instance('UIPadding');
	uiPadding.PaddingBottom = new UDim(0, 0);
	uiPadding.PaddingTop = new UDim(0, 5);
	uiPadding.PaddingLeft = new UDim(0, 5);
	uiPadding.PaddingRight = new UDim(0, 0);
	uiPadding.Parent = scroller;

	labels.push({
		labels: [],
		title: '',
		text: '',
		position: p,
		Color: c,
		instance: holder
	});
}

let mouse = plugin.GetMouse();
UserInputService.InputBegan.Connect((input) => {
	if (enabled && input.UserInputType === Enum.UserInputType.MouseButton1) {
		let h = mouse.Hit
		print('yes.')
		if (UserInputService.IsKeyDown(Enum.KeyCode.LeftControl)) {
			print('creating.')
			createLabel(h.Position);
		}
	}
});



type DataLabel = {
	labels: string[],
	text: string,
	position: Vector3
}

type Label = {
	labels: string[],
	title: string,
	text: string,
	position: Vector3,
	Color: Color3,
	instance: Part
}

