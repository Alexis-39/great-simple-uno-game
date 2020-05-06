interface IFileDescriptor {
    fd: number;
}

declare const systemd: (index?: number) => IFileDescriptor | null;

export = systemd;
