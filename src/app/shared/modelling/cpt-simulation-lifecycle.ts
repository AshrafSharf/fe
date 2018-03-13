import { CptOutput } from './cpt-output';

export interface CptSimulationLifecylce {
    /**
     * Called before Simulation is run.
     */
    simulationInit();

    /**
     * Process all Interface Inputs and propagate to Interface Outputs.
     * Can only be run after simulationInit().
     */
    simulationRun();
    /**
     * Stop accepting Load and collect latency from downstream Components.
     * Can only be run after simulationRun().
     */
    simulationStop();
    /**
     * Process aggregated Simulation Data from the Component and all it's Interfaces.
     * Can only be run after simulationStop().
     */
    simulationPostProcess();

    /**
     * Collect Output Data from Interface, merge with Component Output Data and
     * return to caller.
     * Can only be run after simulationPostProcess().
     * @returns The aggregated Simulation Output
     */
    getOutput(): CptOutput;
}