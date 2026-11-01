import chalk from "chalk";
import {select,isCancel} from "@clack/prompts"
import { runAgentMode } from "./agent/orchestrator";
import { runPlanMode } from "./plan/orchestrator";

export async function runCliMode(){
    while(true){
        const mode = await select({
            message:"Chose CLI sub-mode",
            options:[
                {value:"agent",label:"Agent Mode"},
                {value:"plan",label:"Plan Mode"},
                {value:"ask",label:"Ask Mode"},
                {value:"back",label:"← Back to main menu"}
            ]
        });
        if(isCancel(mode) || mode === 'back'){
            return ;
        }

        if(mode==='agent'){await runAgentMode()};
        if(mode ==='ask'){await runAgentMode()};
        if(mode==='plan'){await runPlanMode()};

        if(mode !== 'agent' && mode !== 'ask' && mode !== 'plan'){
            console.log(chalk.yellow("\nThat mode is not implememnted yet.\n"))
        }
    }
}