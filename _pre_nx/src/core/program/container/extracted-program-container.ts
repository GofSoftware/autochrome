import { ProgramContainer } from './program-container';
import { AutoProgram } from '../auto-program';
import { AutoAction } from '../actions/auto-action';

export class ExtractedProgramContainer {
	public static create(programContainer: ProgramContainer): ExtractedProgramContainer {
		return new ExtractedProgramContainer(programContainer);
	}

	public program: AutoProgram;

	private activeActionHolder: AutoAction;

	private constructor(public programContainer: ProgramContainer) {
		try {
			this.program = AutoProgram.fromString(programContainer.serializedProgram);
			if (this.programContainer.activeActionId != null) {
				this.activeActionHolder = this.program.getActionById(this.programContainer.activeActionId);
			}
		} catch(error) {
			console.log(error);
			this.program = AutoProgram.empty();
			this.programContainer.error = error.toString();
		}
	}

	public get activeAction(): AutoAction {
		return this.activeActionHolder;
	}

	public set activeAction(value: AutoAction) {
		this.programContainer.activeActionId = value ? value.id : null;
		this.activeActionHolder = value;
	}

}
