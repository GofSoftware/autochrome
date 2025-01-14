import { ProgramContainer } from './program-container';
import { AutoProgram } from '../auto-program';
import { AutoAction } from '../actions/auto-action';

export class ExtractedProgramContainer {
	public static create(programContainer: ProgramContainer): ExtractedProgramContainer {
		return new ExtractedProgramContainer(programContainer);
	}

	public program: AutoProgram;

	private activeActionHolder: AutoAction | null = null;

	private constructor(public programContainer: ProgramContainer) {
		try {
			this.program = AutoProgram.fromString(programContainer.serializedProgram);
			if (this.programContainer.activeActionId != null) {
				const foundAction = this.program.getActionById(this.programContainer.activeActionId);
				if (foundAction == null) {
					throw new Error(`Action not found by id: ${this.programContainer.activeActionId}`);
				}
				this.activeActionHolder = foundAction;
			}
		} catch (error: any) {
			console.log(error);
			this.program = AutoProgram.empty();
			this.programContainer.error = error.toString();
		}
	}

	public get activeAction(): AutoAction | null {
		return this.activeActionHolder;
	}

	public set activeAction(value: AutoAction | null) {
		this.activeActionHolder = value;
		this.programContainer.activeActionId = value ? value.id : null;
		this.programContainer.activeActionName = value ? value.name : '';
		this.programContainer.activeActionStartTime = value ? Date.now() : 0;
		this.programContainer.programDescription = this.program.description;
		this.programContainer.programName = this.program.name;
		this.programContainer.activeActionDescription = (value && value.description) ? value.description : '';
		this.programContainer.activeActionIndex = value ? value.index : 0;
		this.programContainer.percent = Math.ceil(this.programContainer.totalActions == 0
			? 0
			: (100 / this.programContainer.totalActions * this.programContainer.activeActionIndex));
	}
}
