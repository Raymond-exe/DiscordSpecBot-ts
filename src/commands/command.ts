export class Command {
    public name: string;
    public description: string;
    public caseSensitive: boolean;
    public aliases: string[];
    public action: Function;
    
    constructor(name: string, aliases: string[] = [], caseSensitive: boolean = false, callback = Command.defaultCallback ) {
        this.name = caseSensitive ? name : name.toLowerCase();
        this.aliases = caseSensitive ? aliases : toLowerCase(aliases);
        this.caseSensitive = caseSensitive;
        this.action = callback;

        function toLowerCase(strs: string[]): string[] {
            let out = [];
            strs.forEach( str => out.push(str.toLowerCase()) );

            return out;
        }
    }

    public setAction(action: Function): Command {
        this.action = action;
        return this;
    }

    public setDescription(desc: string): Command {
        this.description = desc;
        return this;
    }

    public match(phrase: string): boolean {
        phrase = this.caseSensitive ? phrase : phrase.toLowerCase();
        return phrase === this.name || this.aliases.includes(phrase);
    }

    private static defaultCallback(): void {
        console.log(`${this.name} was called! (This default callback was auto-assigned.)`);
    }
}

const helpCmd = new Command('help', ['cmd', 'cmds', 'commands', 'actions'], false);
const searchCmd = new Command('search');


helpCmd.setAction((event) => {

});

searchCmd.setAction((event) => {

});


export const ALL_COMMANDS = [
    helpCmd,
    searchCmd,
];
