import click
import torch
from torch import optim, nn
from torchvision import datasets, transforms
from tqdm import tqdm
import matplotlib.pyplot as plt
import torch.nn as nn
import numpy as np

from common import accuracy_sum, accuracy_mean, Accuracy
from audio_model import AudioModel


@click.command()
@click.option('-p', '--path', help='path to spektrograms', default="./workplace/spektrograms")
@click.option('--gpu', is_flag=True, default=True)
@click.option('-e', '--epochs', help="how many times the entire database will be feeded", default=20)
@click.option('-b', '--batch_size', help='how many spektrograms feed at the same time', default=64)
@click.option('-lr', '--learning_rate', default=0.0001)
def main(path, gpu, epochs, batch_size, learning_rate):
    batch_size = int(batch_size)
    learning_rate = float(learning_rate)

    device = torch.device(
        ('cpu', 'cuda' if torch.cuda.is_available() else 'cpu')[gpu])

    print(f"Device: {device}")

    dataset = datasets.ImageFolder(
        root=path,
        transform=transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.ToTensor()
        ])
    )

    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size

    train_dataset, test_dataset = torch.utils.data.random_split(
        dataset, [train_size, test_size])

    train_dataloader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True
    )

    test_dataloader = torch.utils.data.DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=True
    )

    model = AudioModel()
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate)

    train_accuracy = Accuracy(len(train_dataloader), False)
    test_accuracy = Accuracy(len(test_dataloader), True)

    def test():
        model.eval()

        with torch.no_grad():
            for batch, (inputs, labels) in enumerate(tqdm(test_dataloader, desc='Test Batch')):
                outs = model(inputs.to(device))
                labels = labels.to(device)

                test_accuracy.batch(
                    criterion(outs, labels).item(), outs, labels)

        test_accuracy.step()

    def train():
        model.train()

        for epoch in tqdm(range(epochs), desc='Epoch'):
            for batch, (inputs, labels) in enumerate(tqdm(train_dataloader, desc='Batch')):
                # Forward pass
                outs = model(inputs.to(device))

                # Backward propagation
                labels = labels.to(device)
                loss = criterion(outs, labels)  # .unsqueeze(1)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                train_accuracy.batch(loss.item(), outs, labels)

            train_accuracy.step()

            test()
            model.train()

    train()

    plt.figure()
    plt.plot(train_accuracy.loss_list, '-o')
    plt.plot(test_accuracy.loss_list, '-o')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend(['Train', 'Test'])
    plt.title('Train vs Test Loss')

    plt.figure()
    plt.plot(train_accuracy.accuracy_list, '-o')
    plt.plot(test_accuracy.accuracy_list, '-o')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend(['Train', 'Test'])
    plt.title('Train vs Test Accuracy')

    plt.show()


if __name__ == '__main__':
    main()
