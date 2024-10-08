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
		this.programContainer.activeActionId = value ? value.id : null;
		this.activeActionHolder = value;
	}

}
