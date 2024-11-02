import { Card, CardContent } from "@/components/ui/card";

const CredentailsCard = ({ children }: { children?: React.ReactNode }) => {
    return (
        <Card className="w-full py-3">
            <CardContent>{children}</CardContent>
        </Card>
    );
};

export default CredentailsCard;
