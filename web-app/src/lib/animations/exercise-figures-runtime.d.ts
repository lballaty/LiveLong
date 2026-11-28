// File: exercise-figures-runtime.d.ts
// Description: Type declarations for exercise-figures-runtime.js 0.1.0-draft.2 (generated from src/lib.ts by tsc).
// Author: Libor Ballaty <liborballaty@gmail.com>, with Claude Opus 5.5 (animation-lead-038475, draft export)
// Created: 2026-11-23
type Side = 'L' | 'R';
/** Every key a pose may set: rig DOFs (degrees), pelvis/foot placement (figure units), whole-body channels (degrees). */
export type PoseKeyName = 'pelvis.tilt' | 'pelvis.obliquity' | 'pelvis.yaw' | 'lumbar.flex' | 'lumbar.lat' | 'lumbar.twist' | 'thoracic.flex' | 'thoracic.lat' | 'thoracic.twist' | 'neck.flex' | 'neck.lat' | 'neck.rot' | 'head.nod' | `shoulder${Side}.${'flex' | 'abd' | 'rot'}` | `elbow${Side}.flex` | `forearm${Side}.pron` | `wrist${Side}.${'flex' | 'dev'}` | `hip${Side}.${'flex' | 'abd' | 'rot'}` | `knee${Side}.flex` | `ankle${Side}.${'dorsi' | 'inv'}` | `foot${Side}.${'pitch' | 'yaw'}` | `toe${Side}.ext` | 'pelvis.x' | 'pelvis.y' | 'pelvis.z' | 'stance.width' | `foot${Side}.${'x' | 'z'}`
/** Support (runtime 0.1.0-draft.2): stance.side −1 stands a single-leg variant on the left foot (+1/absent: right);
 *  prop.chair 1 draws a chair in front of the figure, back toward it; handL/R.hold 0..1 rests that hand on its top rail. */
 | 'stance.side' | 'prop.chair' | `hand${Side}.hold` | 'trunk.lean' | 'spine.lat' | 'spine.twist' | 'leg.shin' | 'leg.thigh';
/** Degrees (or figure units for placement keys), or a fraction of the character's own range for that joint. */
export type PackTarget = number | {
    rom: number;
};
export type PackPose = Partial<Record<PoseKeyName, PackTarget>>;
export interface PackKeyframe {
    beat: number;
    label?: string;
    pose: PackPose;
    ease?: 'smooth' | 'minJerk' | 'linear' | 'hold';
}
export interface PackVariant {
    support: 'standing' | 'single-leg' | 'chair';
    stance?: 'together' | 'natural' | 'hip' | 'shoulder' | 'wide' | 'extra-wide';
    rest: PackPose;
    keyframes: PackKeyframe[];
    /** Beat shown when motion is reduced. */
    staticBeat?: number;
}
export type ViewName = 'front' | 'side';
export type VariantName = 'standing' | 'chair';
export type PackStatus = 'draft' | 'released';
/** One exercise-type variation (schema/exercise-pack.schema.json). Data only. */
export interface ExercisePack {
    kind: 'exercise-pack';
    formatVersion: 1;
    /** `<series>.<step>`, e.g. `rajio-taiso.side-bends`. */
    id: string;
    version: string;
    status: PackStatus;
    minRuntimeVersion: string;
    series: string;
    step: string;
    livelongStepId?: string;
    title: string;
    views: ViewName[];
    tempoBpm: number;
    cycleBeats: number;
    /** Odd cycles swap left and right. */
    mirror: boolean;
    variants: {
        standing: PackVariant;
        chair?: PackVariant;
    };
}
export type RomGroupName = 'pelvis' | 'spine' | 'neck' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle';
export interface HumanAppearancePack {
    kind?: 'human';
    hair: 'short' | 'ponytail' | 'receding' | 'bob' | 'bun' | 'thinning';
    glasses: boolean;
    top: 'tshirt' | 'tank' | 'longsleeve' | 'cardigan' | 'sweater';
    bottom: 'shorts' | 'leggings' | 'joggers' | 'pants' | 'slacks' | 'trousers';
    shoes: 'sneakers';
}
export interface RobotAppearancePack {
    kind: 'robot';
    visor: 'band';
}
/** One cast member (schema/character-pack.schema.json): body settings plus appearance from the runtime catalogue. */
export interface CharacterPack {
    kind: 'character-pack';
    formatVersion: 1;
    id: string;
    version: string;
    status: PackStatus;
    minRuntimeVersion: string;
    label: string;
    /** Whether the operator approved this character's drawing at its review gate. */
    approval: 'approved' | 'pending-review';
    approvalNote?: string;
    body: {
        sex: 'male' | 'female' | 'none';
        ageYears: number;
        /** Standing height in figure units (reference figure: 95). */
        height: number;
        build: 'athletic' | 'slim' | 'average' | 'heavier' | 'fuller';
        /** Extra thoracic flexion (degrees) carried in every pose. */
        kyphosis: number;
        rom: Partial<Record<RomGroupName, number>>;
        /** Tempo multiplier: 1 = the exercise's own tempo. */
        pace: number;
        chairByDefault: boolean;
    };
    appearance: HumanAppearancePack | RobotAppearancePack;
}
/** Drawing options the runtime can render; a character pack may only choose from these. */
export interface AppearanceCatalogue {
    human: {
        hair: readonly string[];
        top: readonly string[];
        bottom: readonly string[];
        shoes: readonly string[];
    };
    robot: {
        visor: readonly string[];
    };
}
/** This runtime's version (semver). A pack or bundle whose minRuntimeVersion is newer is refused. */
export declare const RUNTIME_VERSION: string;
/** Pack format this runtime reads (`formatVersion`). */
export declare const PACK_FORMAT_VERSION: 1;
/** Appearance options this runtime can draw. */
export declare const APPEARANCE_CATALOGUE: AppearanceCatalogue;
export type ExerciseFiguresErrorCode = 'INVALID_PACK' | 'UNSUPPORTED_FORMAT' | 'RUNTIME_TOO_OLD' | 'UNKNOWN_POSE_KEY' | 'UNSUPPORTED_APPEARANCE' | 'INVALID_ARGUMENT' | 'DESTROYED';
/** Every error the runtime throws: a machine-readable `code`, a readable message, and `details` for logging. */
export declare class ExerciseFiguresError extends Error {
    readonly code: ExerciseFiguresErrorCode;
    readonly details: Record<string, unknown>;
    constructor(code: ExerciseFiguresErrorCode, message: string, details?: Record<string, unknown>);
}
/** Check an exercise pack object (e.g. JSON the host loaded) and return it typed; throws ExerciseFiguresError. */
export declare function checkExercisePack(value: unknown): ExercisePack;
/** Check a character pack object and return it typed; throws ExerciseFiguresError. */
export declare function checkCharacterPack(value: unknown): CharacterPack;
export interface SampleOptions {
    /** Defaults to 'standing'; a missing chair variant falls back to standing. */
    variant?: VariantName;
    /** Step length: whole cycles fill it, then the rest pose holds. Omit to loop forever. */
    durationSeconds?: number;
}
/** The rig pose (DOF name → degrees / figure units) at `seconds`, without drawing. Matches the in-repo engine. */
export declare function samplePose(exercisePack: ExercisePack, characterPack: CharacterPack, seconds: number, options?: SampleOptions): Record<string, number>;
/** The still key pose shown for reduced motion. */
export declare function sampleStaticPose(exercisePack: ExercisePack, characterPack: CharacterPack, options?: {
    variant?: VariantName;
}): Record<string, number>;
/** Seconds in one cycle of this exercise for this character (mirrored exercises alternate sides every cycle). */
export declare function cycleSecondsOf(exercisePack: ExercisePack, characterPack: CharacterPack): number;
export interface PlayerOptions {
    /** An exercise pack object (the host loads the JSON; the runtime never fetches). */
    exercisePack: ExercisePack;
    /** A character pack object. */
    characterPack: CharacterPack;
    /** Defaults to 'standing'. A pack without the requested variant falls back to standing; read `player.variant`. */
    variant?: VariantName;
    /** Cards to draw, in order. Defaults to every view the pack offers (front, side). */
    views?: ViewName[];
    /** Step length in seconds: whole cycles fill it, then the rest pose holds and the frame loop stops. */
    durationSeconds?: number;
    /** The SVG ink-wobble filter (default true). false draws plain lines with no filter (cheaper on mobile WebKit). */
    inkWobble?: boolean;
    /** Playback speed multiplier (default 1). */
    speed?: number;
}
export interface ExerciseFiguresPlayer {
    /** Current time in seconds. */
    readonly time: number;
    readonly playing: boolean;
    /** Seconds in one cycle for this character. */
    readonly cycleSeconds: number;
    /** The variant actually drawn (standing when a chair variant was asked for but the pack has none). */
    readonly variant: VariantName;
    readonly views: readonly ViewName[];
    /** Draw into `el`: appends one `div.exercise-figures` holding a `div.exercise-card.exercise-card--<view>` per view.
     *  Mounting again elsewhere moves the drawing, keeping time and play state. */
    mount(el: Element): void;
    /** Start the internal requestAnimationFrame clock (starts on mount if called before). */
    play(): void;
    /** Stop the clock and cancel any pending frame. */
    pause(): void;
    /** Jump to a time and draw it (use this to follow an external step timer while paused). */
    seek(seconds: number): void;
    /** Set or clear (undefined) the step length. */
    setDuration(stepSeconds: number | undefined): void;
    setSpeed(speed: number): void;
    /** Stop and show the still key pose (prefers-reduced-motion). play() resumes motion. */
    staticPose(): void;
    /** Stop, cancel every pending frame and remove the runtime's DOM. Idempotent; the player cannot be mounted again. */
    destroy(): void;
}
/** Create a player for one exercise and one character. Draws nothing until mount(). */
export declare function createExercisePlayer(options: PlayerOptions): ExerciseFiguresPlayer;
export {};
