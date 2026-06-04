import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

type OtpInputFieldProps = {
    value: string;
    onChange: (value: string) => void;
    disable?: boolean;
};

export default function OtpInputField({
    value,
    onChange,
    disable,
}: OtpInputFieldProps) {
    return (
        <div className="flex justify-center">
            <InputOTP
                maxLength={6}
                value={value}
                onChange={onChange}
                disabled={disable}
                containerClassName="justify-center"
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} className="size-10 text-base" />
                    <InputOTPSlot index={1} className="size-10 text-base" />
                    <InputOTPSlot index={2} className="size-10 text-base" />
                    <InputOTPSlot index={3} className="size-10 text-base" />
                    <InputOTPSlot index={4} className="size-10 text-base" />
                    <InputOTPSlot index={5} className="size-10 text-base" />
                </InputOTPGroup>   
            </InputOTP>
        </div>
    );
}