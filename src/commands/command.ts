export class Command {
    public name: string;
    public description: string;
    public caseSensitive: boolean;
    public aliases: string[];
    public action: Function;
    
    constructor(name: string, aliases: string[] = [], caseSensitive: boolean = false) {
        this.name = caseSensitive ? name : name.toLowerCase();
        this.aliases = caseSensitive ? aliases : toLowerCase(aliases);
        this.caseSensitive = caseSensitive;

        function toLowerCase(strs: string[]): string[] {
            let out = [];
            strs.forEach(str => {
                out.push(str.toLowerCase());
            })

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

        if(phrase === this.name) {
            return true;
        } else if (this.aliases.includes(phrase)) {
            return true;
        }

        return false;
    }
}