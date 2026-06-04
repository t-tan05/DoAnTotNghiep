type FormErrorProps = {
    message?: string;
};

export default function FormError({message}: FormErrorProps) {
    if(!message) return null;

    return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive whitespace-pre-line">
            {message}
        </div>
    )
}