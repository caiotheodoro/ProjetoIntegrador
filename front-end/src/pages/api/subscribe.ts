import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";

type User = {
    ref: {
        id: string
    }
    data: {
        stripe_customer_id: string
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const session = await getSession({ req });
        console.log("req", req.body)
        console.log("session", session)

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index("user_by_email"),
                    q.Casefold(session.user.email)
                )
            )
        )

        let customerId = user.data.stripe_customer_id

        if (!customerId) {
            const stripeCustomer = await stripe.customers.create(
                { email: session.user.email }

            );


            await fauna.query(
                q.Update(
                    q.Ref(q.Collection("users"), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id
                        }
                    }
                )
            )
            customerId = stripeCustomer.id
        }

        const stripecheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [{
                price: req.body.price,
                quantity: 1,
            }],
            mode: 'subscription',
            subscription_data: {
                metadata: {
                    vehicle: req.body.vehicle,
                    amount: req.body.amount,
                    type: req.body.type,
                    createdAt: req.body.createdAt,
                    plate: req.body.plate,
                    observation: req.body.observation,
                    scheduleDate: req.body.scheduleDate,
                    coupon: req.body.coupon,
                    payment: req.body.payment,
                    vehicleType: req.body.vehicleType,
                },
            },
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,
        });

        return res.status(200).json({
            sessionId: stripecheckoutSession.id,
        });
    } else if (req.method === 'GET') {

        const session = await getSession({ req });
        console.log("req", req)

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index("user_by_email"),
                    q.Casefold(session.user.email)
                )
            )
        )

        let customerId = user.data.stripe_customer_id

        if (!customerId) {
            const stripeCustomer = await stripe.customers.create(
                { email: session.user.email }

            );

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection("users"), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id
                        }
                    }
                )
            )
            customerId = stripeCustomer.id

        }

        await fauna.query(
            q.Get(q.Ref(q.Collection('subscriptions'), '315835746451718211'))
        )
            .then((res) => console.log(res))


    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end(`Method Not Allowed`);
    }
}