export interface Language {
    name: string;
    iconName: string;
    className?: string;
}

export const languages: Record<string, Language> = {

    python: {
        name: "Python",
        iconName: "python",
    },
    numpy: {
        name: "NumPy",
        iconName: "numpy",
    },
    pandas: {
        name: "Pandas",
        iconName: "pandas",
    },
    scikitlearn: {
        name: "scikit-learn",
        iconName: "scikitlearn",
    },
    pymc: {
        name: "PyMC",
        iconName: "pymc",
    },
    deephyper: {
        name: "DeepHyper",
        iconName: "deephyper",
    },


    streamlit: {
        name: "Streamlit",
        iconName: "streamlit",
    },
    fastapi: {
        name: "FastAPI",
        iconName: "fastapi",
    },
    docker: {
        name: "Docker",
        iconName: "docker",
    },
    github: {
        name: "GitHub Actions",
        iconName: "github",
    },


    postgresql: {
        name: "PostgreSQL",
        iconName: "postgresql",
    },
    git: {
        name: "Git",
        iconName: "git",
    },
    linux: {
        name: "Linux",
        iconName: "linux",
    },


    aws: {
        name: "AWS",
        iconName: "aws",
    },
    gcp: {
        name: "gcp",
        iconName: "gcp",
    },


    openstudio: {
        name: "OpenStudio",
        iconName: "openstudio",
    },
    energyplus: {
        name: "EnergyPlus",
        iconName: "energyplus",
    },
    ruby: {
        name: "Ruby",
        iconName: "ruby",
    },


    cursor: {
        name: "Cursor",
        iconName: "cursor-ia",
    },
    windsurf: {
        name: "Windsurf",
        iconName: "windsurf-logo",
    },


};

export const getLanguage = (lang: string): Language => {
    return languages[lang] || languages.html;
};