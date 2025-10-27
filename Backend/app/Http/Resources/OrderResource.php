<?php
// File: Backend/app/Http/Resources/OrderResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage; // penting untuk URL publik

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'order_code'   => $this->order_code,
            'status'       => $this->status,
            'created_at'   => $this->created_at,
            'final_amount' => $this->final_amount,
            'total_amount' => $this->final_amount, // alias untuk FE lama

            'user' => $this->whenLoaded('user', function () {
                return [
                    'id'    => $this->user->id,
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),

            'address' => $this->whenLoaded('address', function () {
                return [
                    'id'             => $this->address->id,
                    'recipient_name' => $this->address->recipient_name ?? null,
                    'phone_number'   => $this->address->phone_number ?? null, // gunakan kolom yang benar
                    'address_line'   => $this->address->address_line ?? null,
                    'city'           => $this->address->city ?? null,
                    'province'       => $this->address->province ?? null,
                    'postal_code'    => $this->address->postal_code ?? null,
                ];
            }),

            'payment' => $this->whenLoaded('payment', function () {
                return [
                    'id'                => $this->payment->id,
                    'status'            => $this->payment->status,
                    'method'            => $this->payment->method ?? null,
                    'confirmed_at'      => $this->payment->confirmed_at,
                    'payment_proof_url' => $this->payment->payment_proof_url
                        ? Storage::url($this->payment->payment_proof_url)   // kembalikan URL publik
                        : null,
                    'admin_notes'       => $this->payment->admin_notes ?? null,
                ];
            }),

            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    return [
                        'id'       => $item->id,
                        'quantity' => $item->quantity,
                        'price'    => $item->price,
                        'book'     => [
                            'id'    => $item->book->id ?? null,
                            'title' => $item->book->title ?? null,
                        ],
                    ];
                });
            }),
        ];
    }
}